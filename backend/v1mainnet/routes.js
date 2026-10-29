import express from "express";
import { ethers } from "ethers";
import { waitUntil } from "@vercel/functions";

import { CHAINS, DEFAULT_CHAIN, SYNC, chainFor, publicChain } from "./config.js";
import { RelayError } from "./relayer.js";
import { serviceFor } from "./services.js";
import { V1mNote, V1mNullifier, V1mOutgoing, V1mSwap, V1mRegistration, seqOf } from "./models.js";

/**
 * /api/v1m — what the website's private app talks to.
 *
 *   GET  /chains                        the chains, for the app's chain switcher
 *   GET  /catch-up?key=                 every chain's indexer catches up
 *                                       (UptimeRobot, every 5 minutes)
 *
 * and per chain, under /api/v1m/<chain>/ (chain = "monad-testnet",
 * "base-sepolia", or its chain id):
 *
 *   GET  /config              chain, pool, tokens, fees, relayer identity
 *   GET  /status              indexer height, counts, tree check, relayer gas
 *   GET  /sync?since=&limit=  every note / nullifier / outgoing record / swap
 *                             after a cursor (one cursor for all of them)
 *   GET  /registration/:addr  registrationOf(addr), from the chain
 *   GET  /quote               the best route for a private swap (Uniswap V3, Capricorn)
 *   GET  /prices              USD price per token (the native coin: its mainnet market)
 *   GET  /fee                 the relayer's fee for an action (see fees.js)
 *   GET  /fees                the fee table, the gas model, the gas price
 *   GET  /token/:address      any token: metadata, accepted by the pool?, price
 *   POST /relay/:kind         submit proven calls (transfer | withdraw | swap)
 *   POST /notify              index a transaction the user just sent
 *
 * The same paths without a chain (/api/v1m/config, …) answer for Monad
 * testnet, as before.
 *
 * The browser never sends keys here, and nothing it asks for reveals which
 * notes are its own: it downloads everything and decrypts locally.
 */

const wrap = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    const status = error instanceof RelayError ? error.status : error.status || 500;
    if (status >= 500) console.error(`[v1m ${req.svc?.chain.id ?? "?"}] ${req.method} ${req.originalUrl}:`, error.message);
    res.status(status).json({ error: error.message, ...(error.extra || {}) });
  }
};

/* ─── catching up on demand (config.js SYNC) ───────────────────────────── */

// the promise's answer, or TIMED_OUT once `ms` have passed (the work carries on)
const TIMED_OUT = Symbol("timed out");
const within = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms, TIMED_OUT).unref())]);

// work still running when the answer goes out: Vercel keeps the function alive for it
const finishLater = (promise) => waitUntil(promise.catch(() => {}));

// still behind after a catch-up (a backlog): keep going once the answer is sent
function keepCatchingUp({ chain, indexer }) {
  waitUntil(indexer.syncNow({ budgetMs: SYNC.backgroundBudgetMs }).catch((error) => console.error(`[v1m ${chain.id}] catch-up:`, error.message)));
}

// the app is about to read this chain: catch up first when the copy is stale
async function freshen(svc) {
  try {
    const run = svc.indexer.syncIfStale({ staleMs: SYNC.staleMs, budgetMs: SYNC.requestBudgetMs });
    const result = await within(run, SYNC.requestBudgetMs + 2000);
    if (result === TIMED_OUT) finishLater(run);
    else if (result && !result.caughtUp) keepCatchingUp(svc);
  } catch (error) {
    // answer from what is stored; the next request tries again
    console.error(`[v1m ${svc.chain.id}] catch-up:`, error.message);
  }
}

// the routes for one chain: req.svc is that chain's service (services.js)
const chainRoutes = express.Router();

chainRoutes.get(
  "/config",
  wrap(async (req, res) => {
    const { chain, relayer } = req.svc;
    let relayerInfo = null;
    try {
      relayerInfo = await relayer.publicRelayerInfo();
    } catch (error) {
      relayerInfo = { error: error.message };
    }
    res.json({
      ...publicChain(chain),
      pool: chain.pool,
      deployBlock: chain.deployBlock,
      swapAdapter: chain.swapAdapter,
      uniswap: { official: chain.uniswap.official, factory: chain.uniswap.factory, swapRouter02: chain.uniswap.swapRouter02, quoterV2: chain.uniswap.quoterV2 },
      venues: req.svc.market.venues.map((v) => ({ id: v.id, name: v.name, adapter: v.adapter })),
      tokens: chain.tokens,
      feePolicy: { profitPct: chain.fees.profitPct, slackPct: chain.fees.slackPct, notesPerSweep: chain.fees.notesPerSweep },
      relayer: relayerInfo,
      gasBufferPct: chain.gas.limitPct,
      gasReserve: chain.gasReserve,
      reserveBalance: chain.reserveBalance ?? "0",
      reserveDelayBlocks: chain.reserveDelayBlocks,
    });
  })
);

chainRoutes.get(
  "/status",
  wrap(async (req, res) => {
    const { chain, indexer, relayer } = req.svc;
    await freshen(req.svc);
    res.json({ chain: chain.id, chainId: chain.chainId, ...(await indexer.status()), relayerBalance: await relayer.relayerBalance().catch(() => null), nativeSymbol: chain.nativeSymbol });
  })
);

chainRoutes.get(
  "/sync",
  wrap(async (req, res) => {
    const { chain, indexer } = req.svc;
    const chainId = chain.chainId;
    const since = Number(req.query.since ?? -1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 5000), 1), 20000);
    if (!Number.isFinite(since)) return res.status(400).json({ error: "since must be a number" });
    await freshen(req.svc);
    /* Only blocks the indexer has FULLY processed. A relayed receipt is
       indexed early, but the cursor must never pass a block before all of its
       events are stored, or a late nullifier would be skipped for good. */
    const status = await indexer.status();
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

chainRoutes.get(
  "/registration/:address",
  wrap(async (req, res) => {
    const { chain, pool } = req.svc;
    let address;
    try {
      address = ethers.getAddress(req.params.address);
    } catch {
      return res.status(400).json({ error: "not an address" });
    }
    // the chain is the answer; the database copy only says when it happened
    const [uc, viewingPublicKey, keyIndex, viewingEpoch] = await pool.registrationOf(address);
    const registered = BigInt(uc) !== 0n;
    const stored = registered ? await V1mRegistration.findOne({ chainId: chain.chainId, address }, { _id: 0, registeredBlock: 1, txHash: 1 }).lean() : null;
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

chainRoutes.get(
  "/quote",
  wrap(async (req, res) => {
    const { tokenIn, tokenOut, amountIn } = req.query;
    try {
      res.json(await req.svc.market.findBestRoute({ tokenIn, tokenOut, amountIn }));
    } catch (error) {
      res.status(400).json({ error: error.shortMessage || error.message });
    }
  })
);

// a token by address (one a user pasted): symbol, decimals, logo if listed,
// whether the pool accepts it, its price, and whether the relayer can take fees in it
chainRoutes.get(
  "/token/:address",
  wrap(async (req, res) => {
    if (!ethers.isAddress(req.params.address)) return res.status(400).json({ error: "not an address" });
    try {
      res.json(await req.svc.market.describeToken(req.params.address));
    } catch {
      res.status(404).json({ error: "no ERC-20 token at that address on this chain" });
    }
  })
);

// the relayer's fee for `calls` proofs of `kind` paid in `token` (swaps: `hops`)
chainRoutes.get(
  "/fee",
  wrap(async (req, res) => {
    const { kind, token, calls, hops } = req.query;
    try {
      res.json(await req.svc.fees.feeQuote({ kind, token, calls: Number(calls || 1), hops: Number(hops || 1) }));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  })
);

chainRoutes.get(
  "/fees",
  wrap(async (req, res) => {
    res.json(await req.svc.fees.feeTable());
  })
);

chainRoutes.get(
  "/prices",
  wrap(async (req, res) => {
    const { chain, market } = req.svc;
    res.json({ chainId: chain.chainId, prices: await market.tokenPrices(), source: market.priceNote });
  })
);

chainRoutes.post(
  "/relay/:kind",
  wrap(async (req, res) => {
    res.json(await req.svc.relayer.relay(req.params.kind, req.body?.calls));
  })
);

chainRoutes.post(
  "/notify",
  wrap(async (req, res) => {
    const { provider, indexer } = req.svc;
    const txHash = String(req.body?.txHash || "");
    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) return res.status(400).json({ error: "txHash required" });
    const receipt = await provider.waitForTransaction(txHash, 1, 30000);
    if (!receipt) return res.status(404).json({ error: "transaction not found yet" });
    const result = await indexer.applyReceipt(receipt);
    res.json({ indexed: true, status: receipt.status, blockNumber: receipt.blockNumber, newNotes: result.newNotes });
  })
);

/* ─── the router ───────────────────────────────────────────────────────── */

const router = express.Router();

router.get("/chains", (_req, res) => {
  res.json({ default: DEFAULT_CHAIN.id, chains: CHAINS.map(publicChain) });
});

/* UptimeRobot's ping (every 5 minutes): what keeps the indexers current on
   Vercel, where nothing runs between requests. Monad answers 100 blocks per
   eth_getLogs, so a chain left alone for a day would need thousands of calls.
   Each chain catches up for at most SYNC.budgetMs before the answer; one
   still behind keeps going in the background. `ok` is false only when a chain
   failed, so a keyword monitor on "ok":true alerts on real trouble. */
router.get("/catch-up", async (req, res) => {
  res.set("Cache-Control", "no-store");
  const key = process.env.V1M_CATCHUP_KEY;
  if (!key && process.env.VERCEL) return res.status(503).json({ ok: false, error: "V1M_CATCHUP_KEY is not set" });
  if (key && req.query.key !== key) return res.status(401).json({ ok: false, error: "wrong or missing key" });

  const chains = await Promise.all(
    CHAINS.map(async (chain) => {
      const svc = serviceFor(chain);
      try {
        const run = svc.indexer.syncNow({ budgetMs: SYNC.budgetMs });
        const result = await within(run, SYNC.budgetMs + 5000);
        if (result === TIMED_OUT) {
          finishLater(run); // a longer catch-up is already under way
          return { chain: chain.id, catchingUp: true };
        }
        if (!result.caughtUp) keepCatchingUp(svc);
        return { chain: chain.id, ...result };
      } catch (error) {
        return { chain: chain.id, error: error.message };
      }
    })
  );
  // warm the prices too, so the app's first /prices answers at once
  for (const chain of CHAINS) {
    waitUntil(serviceFor(chain).market.tokenPrices().catch((error) => console.error(`[v1m ${chain.id}] prices:`, error.message)));
  }
  res.json({ ok: chains.every((c) => !c.error), chains });
});

// the old single-chain paths: Monad testnet
router.use((req, _res, next) => {
  req.svc = serviceFor(DEFAULT_CHAIN);
  next();
}, chainRoutes);

// /api/v1m/<chain>/…
router.use(
  "/:chain",
  (req, res, next) => {
    const chain = chainFor(req.params.chain);
    if (!chain) return res.status(404).json({ error: `unknown chain "${req.params.chain}"`, chains: CHAINS.map((c) => c.id) });
    req.svc = serviceFor(chain);
    next();
  },
  chainRoutes
);

export default router;
