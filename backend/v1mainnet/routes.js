import express from "express";
import { ethers } from "ethers";

import { V1M } from "./config.js";
import { pool, provider } from "./chain.js";
import { indexerStatus, applyReceipt } from "./indexer.js";
import { relay, publicRelayerInfo, relayerBalance, RelayError } from "./relayer.js";
import { findBestRoute, tokenPrices } from "./market.js";
import { feeQuote, feeTable } from "./fees.js";
import { V1mNote, V1mNullifier, V1mOutgoing, V1mSwap, V1mRegistration, seqOf } from "./models.js";

/**
 * /api/v1m — what the website's private app talks to.
 *
 *   GET  /config              chain, pool, tokens, fees, relayer identity
 *   GET  /status              indexer height, counts, tree check, relayer gas
 *   GET  /sync?since=&limit=  every note / nullifier / outgoing record / swap
 *                             after a cursor (one cursor for all of them)
 *   GET  /registration/:addr  registrationOf(addr), from the chain
 *   GET  /quote               best Uniswap V3 route for a private swap
 *   GET  /prices              USD price per token (MON: Monad mainnet's market)
 *   GET  /fee                 the relayer's fee for an action (see fees.js)
 *   GET  /fees                the fee table, the gas model, the gas price
 *   POST /relay/:kind         submit proven calls (transfer | withdraw | swap)
 *   POST /notify              index a transaction the user just sent
 *
 * The browser never sends keys here, and nothing it asks for reveals which
 * notes are its own: it downloads everything and decrypts locally.
 */

const router = express.Router();
const chainId = V1M.chainId;

const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    const status = error instanceof RelayError ? error.status : error.status || 500;
    if (status >= 500) console.error(`[v1m] ${req.method} ${req.path}:`, error.message);
    res.status(status).json({ error: error.message, ...(error.extra || {}) });
  }
};

router.get(
  "/config",
  wrap(async (_req, res) => {
    let relayer = null;
    try {
      relayer = await publicRelayerInfo();
    } catch (error) {
      relayer = { error: error.message };
    }
    res.json({
      id: V1M.id,
      name: V1M.name,
      chainId: V1M.chainId,
      keyNetwork: V1M.keyNetwork,
      nativeSymbol: V1M.nativeSymbol,
      pool: V1M.pool,
      deployBlock: V1M.deployBlock,
      swapAdapter: V1M.swapAdapter,
      uniswap: { factory: V1M.uniswap.factory, swapRouter02: V1M.uniswap.swapRouter02, quoterV2: V1M.uniswap.quoterV2 },
      tokens: V1M.tokens,
      feePolicy: { profitPct: V1M.fees.profitPct, slackPct: V1M.fees.slackPct, notesPerSweep: V1M.fees.notesPerSweep },
      relayer,
      gasBufferPct: V1M.gasBufferPct,
      reserveDelayBlocks: V1M.reserveDelayBlocks,
    });
  })
);

router.get(
  "/status",
  wrap(async (_req, res) => {
    res.json({ ...(await indexerStatus()), relayerBalanceMON: await relayerBalance().catch(() => null) });
  })
);

router.get(
  "/sync",
  wrap(async (req, res) => {
    const since = Number(req.query.since ?? -1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 5000), 1), 20000);
    if (!Number.isFinite(since)) return res.status(400).json({ error: "since must be a number" });
    /* Only blocks the indexer has FULLY processed. A relayed receipt is
       indexed early, but the cursor must never pass a block before all of its
       events are stored, or a late nullifier would be skipped for good. */
    const status = await indexerStatus();
    const ceiling = seqOf(status.indexedBlock, 99999);
    const query = { chainId, seq: { $gt: since, $lte: ceiling } };
    const projection = { _id: 0, chainId: 0 };
    const [notes, nullifiers, outgoing, swaps] = await Promise.all([
      V1mNote.find(query, projection).sort({ seq: 1 }).limit(limit).lean(),
      V1mNullifier.find(query, projection).sort({ seq: 1 }).limit(limit).lean(),
      V1mOutgoing.find(query, projection).sort({ seq: 1 }).limit(limit).lean(),
      V1mSwap.find(query, projection).sort({ seq: 1 }).limit(limit).lean(),
    ]);
    // the cursor only moves past what every list has fully returned
    const truncated = [notes, nullifiers, outgoing, swaps].filter((list) => list.length === limit);
    const cursor = truncated.length ? Math.min(...truncated.map((list) => list[list.length - 1].seq)) : Math.max(since, ceiling);
    res.json({
      chainId,
      indexedBlock: status.indexedBlock,
      tree: status.tree,
      complete: truncated.length === 0,
      cursor,
      notes: truncated.length ? notes.filter((n) => n.seq <= cursor) : notes,
      nullifiers: truncated.length ? nullifiers.filter((n) => n.seq <= cursor) : nullifiers,
      outgoing: truncated.length ? outgoing.filter((n) => n.seq <= cursor) : outgoing,
      swaps: truncated.length ? swaps.filter((n) => n.seq <= cursor) : swaps,
    });
  })
);

router.get(
  "/registration/:address",
  wrap(async (req, res) => {
    let address;
    try {
      address = ethers.getAddress(req.params.address);
    } catch {
      return res.status(400).json({ error: "not an address" });
    }
    // the chain is the answer; the database copy only says when it happened
    const [uc, viewingPublicKey, keyIndex, viewingEpoch] = await pool.registrationOf(address);
    const registered = BigInt(uc) !== 0n;
    const stored = registered ? await V1mRegistration.findOne({ chainId, address }, { _id: 0, registeredBlock: 1, txHash: 1 }).lean() : null;
    res.json({
      address,
      registered,
      userCommitment: registered ? uc : null,
      viewingPublicKey: registered ? viewingPublicKey : null,
      keyIndex: Number(keyIndex),
      viewingEpoch: Number(viewingEpoch),
      registeredBlock: stored?.registeredBlock ?? null,
    });
  })
);

router.get(
  "/quote",
  wrap(async (req, res) => {
    const { tokenIn, tokenOut, amountIn } = req.query;
    try {
      res.json(await findBestRoute({ tokenIn, tokenOut, amountIn }));
    } catch (error) {
      res.status(400).json({ error: error.shortMessage || error.message });
    }
  })
);

// the relayer's fee for `calls` proofs of `kind` paid in `token` (swaps: `hops`)
router.get(
  "/fee",
  wrap(async (req, res) => {
    const { kind, token, calls, hops } = req.query;
    try {
      res.json(await feeQuote({ kind, token, calls: Number(calls || 1), hops: Number(hops || 1) }));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  })
);

router.get(
  "/fees",
  wrap(async (_req, res) => {
    res.json(await feeTable());
  })
);

router.get(
  "/prices",
  wrap(async (_req, res) => {
    res.json({ prices: await tokenPrices(), source: "MON: Monad mainnet WMON/USDC pool · mUSDC: $1 · others: testnet pools vs mUSDC" });
  })
);

router.post(
  "/relay/:kind",
  wrap(async (req, res) => {
    const result = await relay(req.params.kind, req.body?.calls);
    res.json(result);
  })
);

router.post(
  "/notify",
  wrap(async (req, res) => {
    const txHash = String(req.body?.txHash || "");
    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) return res.status(400).json({ error: "txHash required" });
    const receipt = await provider.waitForTransaction(txHash, 1, 30000);
    if (!receipt) return res.status(404).json({ error: "transaction not found yet" });
    const result = await applyReceipt(receipt);
    res.json({ indexed: true, status: receipt.status, blockNumber: receipt.blockNumber, newNotes: result.newNotes });
  })
);

export default router;
