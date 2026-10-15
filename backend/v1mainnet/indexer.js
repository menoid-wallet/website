import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";

import { poolInterface, hex32 } from "./chain.js";
import { initCrypto, poseidonHash } from "./crypto.js";
import {
  V1mNote,
  V1mNullifier,
  V1mOutgoing,
  V1mSwap,
  V1mRegistration,
  V1mState,
  seqOf,
} from "./models.js";

/**
 * The v1-mainnet indexer, one per chain: reads the pool's events from the
 * chain into the V1mainnet.* collections (every document carries its chainId).
 *
 *   - windows of logWindow blocks (Monad caps eth_getLogs at 100, Base's
 *     public endpoint at 200), from the deploy block
 *   - every write is an upsert on the event's natural key, so a block read
 *     twice (a restart, a receipt applied early by the relayer) changes nothing
 *   - after each catch-up with new notes, the tree is rebuilt from the
 *     database and its root must be one the contract has had
 *
 * Nothing here is private: it is the chain's public log, kept so a wallet can
 * sync in one request.
 */

const CHUNK = 4;
const DEPTH = 20;
const STATE_KEY = "indexer";

const lower = (a) => String(a).toLowerCase();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const hash = (inputs) => poseidonHash(inputs);

export function createIndexer({ chain, logsProvider, pool }) {
  const chainId = chain.chainId;
  let running = false;
  let stopRequested = false;
  let lastError = null;
  let lastPollAt = null;
  let chainHead = null;
  const trees = new Map(); // treeId -> { tree, size }

  async function loadState() {
    let state = await V1mState.findOne({ chainId, key: STATE_KEY }).lean();
    if (!state) {
      state = (await V1mState.create({ chainId, key: STATE_KEY, lastBlock: chain.deployBlock - 1 })).toObject();
    }
    return state;
  }

  /* ─── applying logs ────────────────────────────────────────────────────── */

  function parse(log) {
    if (lower(log.address) !== lower(chain.pool)) return null;
    try {
      return poolInterface.parseLog({ topics: log.topics, data: log.data });
    } catch {
      return null;
    }
  }

  async function applyLogs(logs) {
    const ops = { notes: [], nullifiers: [], outgoing: [], swaps: [], registrations: [] };
    let newNotes = 0;

    const sorted = [...logs].sort((a, b) => a.blockNumber - b.blockNumber || (a.index ?? a.logIndex) - (b.index ?? b.logIndex));
    for (const log of sorted) {
      const event = parse(log);
      if (!event) continue;
      const logIndex = log.index ?? log.logIndex;
      const base = { chainId, blockNumber: log.blockNumber, txHash: log.transactionHash, seq: seqOf(log.blockNumber, logIndex) };
      const a = event.args;

      switch (event.name) {
        case "NoteCreated": {
          const doc = { ...base, treeId: Number(a.treeId), leafIndex: Number(a.leafIndex), commitment: hex32(a.commitment), encryptedNote: a.encryptedNote };
          ops.notes.push({ updateOne: { filter: { chainId, treeId: doc.treeId, leafIndex: doc.leafIndex }, update: { $setOnInsert: doc }, upsert: true } });
          newNotes += 1;
          break;
        }
        case "NullifierSpent": {
          const doc = { ...base, nullifier: hex32(a.nullifier) };
          ops.nullifiers.push({ updateOne: { filter: { chainId, nullifier: doc.nullifier }, update: { $setOnInsert: doc }, upsert: true } });
          break;
        }
        case "OutgoingRecord": {
          const doc = { ...base, firstNullifier: hex32(a.firstNullifier), record: a.record };
          ops.outgoing.push({ updateOne: { filter: { chainId, firstNullifier: doc.firstNullifier }, update: { $setOnInsert: doc }, upsert: true } });
          break;
        }
        case "Swapped": {
          const doc = {
            ...base,
            commitment: hex32(a.commitment),
            tokenIn: a.tokenIn,
            tokenOut: a.tokenOut,
            amountIn: a.amountIn.toString(),
            amountOut: a.amountOut.toString(),
            adapter: a.adapter,
          };
          ops.swaps.push({ updateOne: { filter: { chainId, commitment: doc.commitment }, update: { $setOnInsert: doc }, upsert: true } });
          break;
        }
        case "Registered": {
          const doc = {
            chainId,
            address: a.wallet,
            userCommitment: hex32(a.userCommitment),
            viewingPublicKey: a.viewingPublicKey,
            keyIndex: 0,
            viewingEpoch: 0,
            registeredBlock: log.blockNumber,
            updatedBlock: log.blockNumber,
            txHash: log.transactionHash,
            seq: base.seq,
          };
          ops.registrations.push({ updateOne: { filter: { chainId, address: a.wallet, seq: { $not: { $gt: base.seq } } }, update: { $set: doc }, upsert: true } });
          break;
        }
        case "ViewingKeyUpdated": {
          ops.registrations.push({
            updateOne: {
              filter: { chainId, address: a.wallet, seq: { $lt: base.seq } },
              update: { $set: { viewingPublicKey: a.viewingPublicKey, viewingEpoch: Number(a.viewingEpoch), updatedBlock: log.blockNumber, txHash: log.transactionHash, seq: base.seq } },
            },
          });
          break;
        }
        case "KeysRotated": {
          ops.registrations.push({
            updateOne: {
              filter: { chainId, address: a.wallet, seq: { $lt: base.seq } },
              update: {
                $set: {
                  userCommitment: hex32(a.userCommitment),
                  viewingPublicKey: a.viewingPublicKey,
                  keyIndex: Number(a.keyIndex),
                  viewingEpoch: 0,
                  updatedBlock: log.blockNumber,
                  txHash: log.transactionHash,
                  seq: base.seq,
                },
              },
            },
          });
          break;
        }
        default:
          break;
      }
    }

    // registrations in order (ordered: true), everything else in any order
    if (ops.notes.length) await V1mNote.bulkWrite(ops.notes, { ordered: false });
    if (ops.nullifiers.length) await V1mNullifier.bulkWrite(ops.nullifiers, { ordered: false });
    if (ops.outgoing.length) await V1mOutgoing.bulkWrite(ops.outgoing, { ordered: false });
    if (ops.swaps.length) await V1mSwap.bulkWrite(ops.swaps, { ordered: false });
    for (const op of ops.registrations) {
      try {
        await V1mRegistration.bulkWrite([op], { ordered: true });
      } catch (error) {
        // a duplicate key on an upsert means a newer record is already stored
        if (error?.code !== 11000) throw error;
      }
    }
    return { newNotes };
  }

  /* ─── the tree ─────────────────────────────────────────────────────────── */

  /* Rebuild (or extend) each tree from the stored notes. Every operation
     inserts one aligned chunk of 4 leaves and the leaves without a note are
     zero, so a tree's size is the end of its last chunk. */
  async function verifyTrees() {
    await initCrypto();
    const results = [];
    const treeIds = await V1mNote.distinct("treeId", { chainId });
    for (const treeId of treeIds.sort((a, b) => a - b)) {
      let entry = trees.get(treeId);
      if (!entry) {
        entry = { tree: new IncrementalMerkleTree(hash, DEPTH, 0n, 2), size: 0 };
        trees.set(treeId, entry);
      }
      const notes = await V1mNote.find({ chainId, treeId, leafIndex: { $gte: entry.size } }, { leafIndex: 1, commitment: 1 })
        .sort({ leafIndex: 1 })
        .lean();
      if (notes.length) {
        const end = Math.max(...notes.map((n) => (Math.floor(n.leafIndex / CHUNK) + 1) * CHUNK));
        const leaves = new Array(end - entry.size).fill(0n);
        for (const n of notes) leaves[n.leafIndex - entry.size] = BigInt(n.commitment);
        for (const leaf of leaves) entry.tree.insert(leaf);
        entry.size = end;
      }

      const root = hex32(entry.tree.root);
      const known = await pool.isKnownRoot(treeId, root);
      results.push({ treeId, leaves: entry.size, root, known });
      if (!known) {
        // the stored notes do not rebuild a tree the chain ever had: start over
        trees.delete(treeId);
      }
      await V1mState.updateOne(
        { chainId, key: STATE_KEY },
        { $set: { treeId, root, leaves: entry.size, rootVerified: known, updatedAt: new Date() } }
      );
    }
    return results;
  }

  /* ─── catch-up ─────────────────────────────────────────────────────────── */

  async function catchUp({ log = () => {} } = {}) {
    const state = await loadState();
    let from = state.lastBlock + 1;
    chainHead = await logsProvider.getBlockNumber();
    let newNotes = 0;

    while (from <= chainHead && !stopRequested) {
      const to = Math.min(chainHead, from + chain.indexer.logWindow - 1);
      const logs = await logsProvider.getLogs({ address: chain.pool, fromBlock: from, toBlock: to });
      if (logs.length) {
        const applied = await applyLogs(logs);
        newNotes += applied.newNotes;
        log(`  blocks ${from}-${to}: ${logs.length} pool events`);
      }
      await V1mState.updateOne({ chainId, key: STATE_KEY }, { $set: { lastBlock: to, updatedAt: new Date() } });
      from = to + 1;
    }
    lastPollAt = new Date();
    return { newNotes, head: chainHead };
  }

  /** A transaction the backend just relayed (or a user just sent): index its
      logs now instead of waiting for the next poll. Idempotent. */
  async function applyReceipt(receipt) {
    const pending = (receipt?.logs || []).filter((l) => lower(l.address) === lower(chain.pool));
    if (!pending.length) return { newNotes: 0 };
    const result = await applyLogs(
      pending.map((l) => ({ ...l, blockNumber: receipt.blockNumber, transactionHash: receipt.hash || receipt.transactionHash }))
    );
    if (result.newNotes) await verifyTrees().catch((e) => console.error(`[v1m ${chain.id}] tree check:`, e.message));
    return result;
  }

  async function backfill({ log = console.log } = {}) {
    await initCrypto();
    const state = await loadState();
    log(`[v1m] indexing ${chain.name} pool ${chain.pool} from block ${state.lastBlock + 1}`);
    const { head } = await catchUp({ log });
    const trees = await verifyTrees();
    return { head, trees };
  }

  function start() {
    if (running) return;
    running = true;
    stopRequested = false;
    (async () => {
      await initCrypto();
      let checked = false;
      while (!stopRequested) {
        try {
          const { newNotes } = await catchUp();
          if (newNotes || !checked) {
            const results = await verifyTrees();
            checked = true;
            for (const r of results) {
              if (!r.known) console.error(`[v1m ${chain.id}] tree ${r.treeId}: rebuilt root ${r.root} is NOT known to the pool — rebuilding`);
            }
          }
          lastError = null;
        } catch (error) {
          lastError = error?.message || String(error);
          console.error(`[v1m ${chain.id}] indexer:`, lastError);
        }
        await sleep(chain.indexer.pollMs);
      }
      running = false;
    })();
  }

  function stop() {
    stopRequested = true;
  }

  async function status() {
    const state = await loadState();
    const [notes, nullifiers, registrations] = await Promise.all([
      V1mNote.countDocuments({ chainId }),
      V1mNullifier.countDocuments({ chainId }),
      V1mRegistration.countDocuments({ chainId }),
    ]);
    return {
      running,
      indexedBlock: state.lastBlock,
      chainHead,
      lag: chainHead !== null ? Math.max(0, chainHead - state.lastBlock) : null,
      notes,
      nullifiers,
      registrations,
      tree: { treeId: state.treeId, leaves: state.leaves, root: state.root, verified: state.rootVerified },
      lastPollAt,
      lastError,
    };
  }

  return { start, stop, status, applyReceipt, backfill };
}
