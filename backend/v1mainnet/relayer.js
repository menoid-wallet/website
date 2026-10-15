import { ethers } from "ethers";

import { revertReason, hex32 } from "./chain.js";
import { initCrypto, keyMessage, deriveKeysFromSignature, tryDecryptNote, notePublicKey, noteCommitment } from "./crypto.js";
import { V1mRelay } from "./models.js";

/**
 * The relayer: submits private transactions the browser has already proven,
 * so the user's own address never appears on them, and pays their gas.
 *
 * It is paid by a private note in the token being spent (the fee output of
 * every proof). Before spending any gas it checks that note:
 *   - it opens with the relayer's viewing key,
 *   - it really is a note for the relayer: Poseidon(token, amount, npk) equals
 *     the commitment the proof creates,
 *   - it is worth at least the fee for that token.
 * Then it simulates the call (an invalid proof, a spent note or a stale root
 * fails here, for free) and only then sends it.
 *
 * One relayer per chain. Every spend on a chain is serialized through that
 * chain's lock: one relayer key, one nonce sequence per chain.
 */

class Mutex {
  #queue = Promise.resolve();
  run(fn) {
    const next = this.#queue.then(() => fn());
    this.#queue = next.catch(() => {});
    return next;
  }
}

export class RelayError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const FEE_OUTPUT = { transfer: 2, withdraw: 1, swap: 1 };
const lower = (a) => String(a).toLowerCase();

// a Uniswap V3 path: token (20) | fee (3) | token (20) | …
const hopsOf = (routeData) => Math.max(1, Math.round((ethers.dataLength(routeData) - 20) / 23));

function checkShape(kind, calls) {
  if (!Object.hasOwn(FEE_OUTPUT, kind)) throw new RelayError(404, `unknown action "${kind}"`);
  if (!Array.isArray(calls) || calls.length === 0 || calls.length > 4) {
    throw new RelayError(400, "send 1 to 4 calls");
  }
  for (const call of calls) {
    if (!call || typeof call !== "object" || !call.proof || !Array.isArray(call.nullifiers) || !Array.isArray(call.outCommitments)) {
      throw new RelayError(400, "malformed call");
    }
  }
}

export function createRelayer({ chain, provider, pool, relayerSigner }, { indexer, fees, market }) {
  const lock = new Mutex();
  let identity = null;

  async function relayerIdentity() {
    if (identity) return identity;
    const signer = relayerSigner();
    if (!signer) throw new RelayError(503, `the relayer has no key configured (${chain.relayerKeyEnv})`);
    await initCrypto();
    const [uc, viewingPublicKey, keyIndex, viewingEpoch] = await pool.registrationOf(signer.address);
    const signature = await signer.signMessage(keyMessage({ network: chain.keyNetwork, keyIndex: Number(keyIndex) }));
    const keys = deriveKeysFromSignature(signer.address, signature, {
      network: chain.keyNetwork,
      keyIndex: Number(keyIndex),
      viewingEpoch: Number(viewingEpoch),
    });
    identity = {
      address: signer.address,
      userCommitment: keys.userCommitment,
      userCommitmentBytes32: keys.userCommitmentBytes32,
      viewingPublicKey: keys.ivkPub,
      ivk: keys.ivk,
      registered: BigInt(uc) === keys.userCommitment && lower(viewingPublicKey) === lower(keys.ivkPub),
    };
    return identity;
  }

  async function publicRelayerInfo() {
    const id = await relayerIdentity();
    return {
      address: id.address,
      userCommitment: id.userCommitmentBytes32,
      viewingPublicKey: id.viewingPublicKey,
      registered: id.registered,
    };
  }

  function checkFee(kind, call, id) {
    const index = FEE_OUTPUT[kind];
    const ciphertext = call?.ext?.encryptedOutputs?.[index];
    if (typeof ciphertext !== "string") throw new RelayError(400, "malformed call: missing the fee note");
    if (hex32(call.relayer) !== hex32(id.userCommitment)) throw new RelayError(400, "this proof pays a different relayer");

    const note = tryDecryptNote(id.ivk, ciphertext);
    if (!note || note.flags !== 0) throw new RelayError(400, "the fee note is not encrypted to this relayer");
    const commitment = noteCommitment(note.token, note.amount, notePublicKey(id.userCommitment, note.randomness));
    if (hex32(commitment) !== hex32(call.outCommitments[index])) throw new RelayError(400, "the fee note does not match the proof");

    const spent = kind === "withdraw" ? call.token : kind === "swap" ? call.tokenIn : note.token;
    if (lower(spent) !== lower(note.token)) throw new RelayError(400, "the fee must be paid in the token being spent");
    return { tokenAddress: note.token, amount: note.amount };
  }

  // the fee's token: any token the relayer can price (it is paid in it)
  async function feeTokenOf(address) {
    let token;
    try {
      token = await market.tokenMeta(address);
    } catch {
      throw new RelayError(400, "the fee note's token is not an ERC-20");
    }
    if (!((await market.priceOf(token.address)) > 0)) {
      throw new RelayError(400, `this relayer cannot price ${token.symbol} yet, so it cannot take its fee in it`);
    }
    return token;
  }

  async function relay(kind, calls) {
    const started = Date.now();
    checkShape(kind, calls);
    const id = await relayerIdentity();
    if (!id.registered) throw new RelayError(503, "the relayer's private identity is not registered on this pool");

    const notes = calls.map((call) => checkFee(kind, call, id));
    const token = await feeTokenOf(notes[0].tokenAddress);
    if (notes.some((n) => lower(n.tokenAddress) !== lower(token.address))) throw new RelayError(400, "every proof must pay its fee in the same token");
    const paid = notes.map((n) => ({ token, amount: n.amount }));
    const feeToken = token.address;
    const feeAmount = paid.reduce((sum, f) => sum + f.amount, 0n).toString();
    const hops = kind === "swap" ? Math.max(...calls.map((c) => hopsOf(c.ext.routeData))) : undefined;

    let data;
    try {
      data = pool.interface.encodeFunctionData(kind, [calls]);
    } catch (error) {
      throw new RelayError(400, `malformed call: ${error.shortMessage || error.message}`);
    }

    return lock.run(async () => {
      let estimate;
      try {
        estimate = await provider.estimateGas({ from: id.address, to: chain.pool, data });
      } catch (error) {
        const reason = revertReason(error);
        await V1mRelay.create({ chainId: chain.chainId, kind, calls: calls.length, hops, status: "rejected", reason, feeToken, feeAmount, durationMs: Date.now() - started }).catch(() => {});
        throw new RelayError(400, reason);
      }

      // break-even on THIS transaction: the fee notes must cover its real cost
      const cover = await fees.coversCost({ gasEstimate: estimate, calls: calls.length, fees: paid, dataBytes: ethers.dataLength(data) });
      if (!cover.ok) {
        const required = await fees.feeQuote({ kind, token: feeToken, calls: calls.length, hops });
        await V1mRelay.create({
          chainId: chain.chainId, kind, calls: calls.length, hops, status: "underpaid", feeToken, feeAmount,
          gasEstimate: estimate.toString(), costNative: ethers.formatEther(cover.costWei), paidNative: ethers.formatEther(cover.paidWei),
          durationMs: Date.now() - started,
        }).catch(() => {});
        throw new RelayError(409, "Network fees moved since your quote — a fresh fee is needed", { code: "fee_too_low", required });
      }

      const gasLimit = (estimate * BigInt(chain.gas.limitPct)) / 100n;
      const tx = await relayerSigner().sendTransaction({ to: chain.pool, data, gasLimit });
      const entry = await V1mRelay.create({
        chainId: chain.chainId,
        kind,
        calls: calls.length,
        hops,
        status: "submitted",
        txHash: tx.hash,
        gasEstimate: estimate.toString(),
        gasLimit: gasLimit.toString(),
        gasPriceGwei: Number(ethers.formatUnits(cover.gasPriceWei, "gwei")),
        costNative: ethers.formatEther(cover.costWei),
        paidNative: ethers.formatEther(cover.paidWei),
        feeToken,
        feeAmount,
      }).catch(() => null);

      let receipt;
      try {
        receipt = await tx.wait(1, 120000);
      } catch (error) {
        receipt = error?.receipt || null;
        if (!receipt) {
          if (entry) await V1mRelay.updateOne({ _id: entry._id }, { $set: { status: "reverted", reason: revertReason(error), durationMs: Date.now() - started } });
          throw new RelayError(502, `transaction ${tx.hash} did not confirm: ${revertReason(error)}`, { txHash: tx.hash });
        }
      }
      if (receipt.status !== 1) {
        if (entry) await V1mRelay.updateOne({ _id: entry._id }, { $set: { status: "reverted", durationMs: Date.now() - started } });
        throw new RelayError(502, `transaction ${tx.hash} reverted on-chain`, { txHash: tx.hash });
      }

      await indexer.applyReceipt(receipt).catch((e) => console.error(`[v1m ${chain.id}] indexing a relayed receipt:`, e.message));

      let swap = null;
      for (const log of receipt.logs) {
        if (lower(log.address) !== lower(chain.pool)) continue;
        try {
          const event = pool.interface.parseLog(log);
          if (event?.name === "Swapped") {
            swap = { amountOut: event.args.amountOut.toString(), commitment: hex32(event.args.commitment), tokenOut: event.args.tokenOut };
          }
        } catch {
          // not a pool event
        }
      }

      if (entry) await V1mRelay.updateOne({ _id: entry._id }, { $set: { status: "confirmed", durationMs: Date.now() - started } });
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasEstimate: estimate.toString(),
        gasLimit: gasLimit.toString(),
        fee: { token: feeToken, amount: feeAmount },
        swap,
      };
    });
  }

  async function relayerBalance() {
    const signer = relayerSigner();
    if (!signer) return null;
    return ethers.formatEther(await provider.getBalance(signer.address));
  }

  return { relayerIdentity, publicRelayerInfo, relay, relayerBalance };
}
