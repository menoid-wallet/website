/**
 * The browser's copy of the pool, and what a set of keys can see in it.
 *
 * Mirror   — every note, nullifier, outgoing record and swap, synced from
 *            the backend with one cursor; the Merkle trees are rebuilt here,
 *            so a proof never asks anyone for "the path to my note".
 * scan()   — the viewing-key scanner (protocol repo: helpers/scanner.js):
 *            ivk opens incoming notes, nk tells which are spent, ovk opens the
 *            records of payments made.
 */
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";

import {
  CHUNK_SIZE,
  TREE_DEPTH,
  NOTE_FLAGS,
  ACTION,
  poseidonHash,
  notePublicKey,
  noteCommitment,
  noteNullifier,
  tryDecryptNote,
  tryDecryptOutgoingRecord,
  deriveIncomingViewingKey,
  deriveOutgoingViewingKey,
  toBytes32,
  type OutgoingRecord,
  type PrivateKeys,
} from "./protocol.ts";
import type { SyncResponse } from "./api.ts";

export type PoolNote = {
  treeId: number;
  leafIndex: number;
  commitment: bigint;
  encryptedNote: string;
  blockNumber: number;
  txHash: string;
  seq: number;
};

export type SwapOutput = { tokenIn: string; tokenOut: string; amountIn: bigint; amountOut: bigint; txHash: string; blockNumber: number };

type Tree = { tree: IncrementalMerkleTree; size: number };

export class Mirror {
  notes: PoolNote[] = [];
  nullifiers = new Map<string, { txHash: string; blockNumber: number }>(); // decimal -> where it was spent
  outgoing = new Map<string, { record: string; txHash: string; blockNumber: number }>();
  swapOutputs = new Map<string, SwapOutput>();
  indexedBlock = 0;
  cursor = -1;
  private trees = new Map<number, Tree>();

  /** Pull everything new. Returns how many new notes arrived. */
  async sync(fetchPage: (since: number) => Promise<SyncResponse>): Promise<number> {
    let added = 0;
    for (let page = 0; page < 200; page++) {
      const res = await fetchPage(this.cursor);
      for (const n of res.notes) {
        this.notes.push({ ...n, commitment: BigInt(n.commitment) });
        added += 1;
      }
      for (const n of res.nullifiers) this.nullifiers.set(BigInt(n.nullifier).toString(), { txHash: n.txHash, blockNumber: n.blockNumber });
      for (const o of res.outgoing) this.outgoing.set(BigInt(o.firstNullifier).toString(), { record: o.record, txHash: o.txHash, blockNumber: o.blockNumber });
      for (const s of res.swaps) {
        this.swapOutputs.set(BigInt(s.commitment).toString(), {
          tokenIn: s.tokenIn,
          tokenOut: s.tokenOut,
          amountIn: BigInt(s.amountIn),
          amountOut: BigInt(s.amountOut),
          txHash: s.txHash,
          blockNumber: s.blockNumber,
        });
      }
      this.cursor = Math.max(this.cursor, res.cursor);
      this.indexedBlock = res.indexedBlock;
      if (res.complete) break;
    }
    if (added) this.extendTrees();
    return added;
  }

  /* Every operation inserts one aligned chunk of 4 leaves; leaves without a
     note are zero. Notes arrive in chain order, so trees only ever grow. */
  private extendTrees() {
    const byTree = new Map<number, PoolNote[]>();
    for (const n of this.notes) {
      const list = byTree.get(n.treeId) || [];
      list.push(n);
      byTree.set(n.treeId, list);
    }
    for (const [treeId, notes] of byTree) {
      let entry = this.trees.get(treeId);
      if (!entry) {
        entry = { tree: new IncrementalMerkleTree((xs: bigint[]) => poseidonHash(xs), TREE_DEPTH, 0n, 2), size: 0 };
        this.trees.set(treeId, entry);
      }
      const fresh = notes.filter((n) => n.leafIndex >= entry!.size);
      if (!fresh.length) continue;
      const end = Math.max(...fresh.map((n) => (Math.floor(n.leafIndex / CHUNK_SIZE) + 1) * CHUNK_SIZE));
      const leaves: bigint[] = new Array(end - entry.size).fill(0n);
      for (const n of fresh) leaves[n.leafIndex - entry.size] = n.commitment;
      for (const leaf of leaves) entry.tree.insert(leaf);
      entry.size = end;
    }
  }

  latestTreeId(): number {
    return Math.max(0, ...this.trees.keys());
  }

  root(treeId: number): bigint {
    const entry = this.trees.get(treeId);
    if (!entry) throw new Error(`no tree ${treeId}`);
    return BigInt(entry.tree.root);
  }

  merkleProof(treeId: number, leafIndex: number) {
    const entry = this.trees.get(treeId);
    if (!entry) throw new Error(`no tree ${treeId}`);
    const proof = entry.tree.createProof(leafIndex);
    return {
      root: BigInt(proof.root),
      leaf: BigInt(proof.leaf),
      pathElements: proof.siblings.map((s: bigint[]) => BigInt(s[0])),
      pathIndices: proof.pathIndices as number[],
    };
  }

  isSpent(nullifier: bigint): boolean {
    return this.nullifiers.has(BigInt(nullifier).toString());
  }
}

/* ─── scanning ─────────────────────────────────────────────────────────── */

export type OwnedNote = PoolNote & {
  token: string;
  amount: bigint;
  randomness: bigint;
  epoch: number;
  fromSwap: boolean;
  nullifier: bigint;
  spent: boolean;
  spentTx?: string;
};

export type ActivityItem =
  | { kind: "received"; token: string; amount: bigint; txHash: string; blockNumber: number; fromSwap: boolean; leafIndex: number }
  | { kind: "sent" | "unmasked" | "swapped"; record: OutgoingRecord; txHash: string; blockNumber: number };

export type WalletView = {
  notes: OwnedNote[];
  unspent: OwnedNote[];
  balances: Record<string, bigint>; // token -> unspent amount
  activity: ActivityItem[];
};

export function scan(mirror: Mirror, keys: PrivateKeys): WalletView {
  const epochs = Array.from({ length: keys.viewingEpoch + 1 }, (_, e) => e);
  const ivks = epochs.map((epoch) => ({ epoch, ivk: deriveIncomingViewingKey(keys.incomingSecret, epoch).ivk }));
  const ovks = epochs.map((epoch) => ({ epoch, ovk: deriveOutgoingViewingKey(keys.outgoingSecret, epoch) }));

  const notes: OwnedNote[] = [];
  for (const event of mirror.notes) {
    for (const { epoch, ivk } of ivks) {
      const plain = tryDecryptNote(ivk, event.encryptedNote);
      if (!plain) continue;
      // a swap's bought note: the pool published the amount after the trade
      if (plain.flags & NOTE_FLAGS.AMOUNT_FROM_EVENT) {
        const swapped = mirror.swapOutputs.get(event.commitment.toString());
        if (!swapped) break;
        plain.amount = swapped.amountOut;
      }
      // anyone can encrypt to us: accept only what rebuilds the stored commitment
      const npk = notePublicKey(keys.userCommitment, plain.randomness);
      if (noteCommitment(plain.token, plain.amount, npk) !== event.commitment) break;
      // zero-value notes are the dummy outputs of fixed-shape spends
      if (plain.amount === 0n) break;
      const nullifier = noteNullifier(keys.nullifierKey, event.commitment, plain.randomness);
      const spentAt = mirror.nullifiers.get(nullifier.toString());
      notes.push({
        ...event,
        token: plain.token,
        amount: plain.amount,
        randomness: plain.randomness,
        epoch,
        fromSwap: Boolean(plain.flags & NOTE_FLAGS.AMOUNT_FROM_EVENT),
        nullifier,
        spent: Boolean(spentAt),
        spentTx: spentAt?.txHash,
      });
      break;
    }
  }

  const balances: Record<string, bigint> = {};
  for (const n of notes) if (!n.spent) balances[n.token] = (balances[n.token] ?? 0n) + n.amount;

  // what this wallet sent: outgoing records keyed by each spend's first nullifier
  const activity: ActivityItem[] = [];
  const ownSpendTxs = new Set<string>();
  for (const n of notes) {
    if (!n.spent) continue;
    const entry = mirror.outgoing.get(n.nullifier.toString());
    if (!entry) continue;
    for (const { epoch, ovk } of ovks) {
      const record = tryDecryptOutgoingRecord(ovk, n.nullifier, entry.record);
      if (!record) continue;
      void epoch;
      ownSpendTxs.add(entry.txHash);
      const kind = record.action === ACTION.SWAP ? "swapped" : record.action === ACTION.WITHDRAW ? "unmasked" : "sent";
      activity.push({ kind, record, txHash: entry.txHash, blockNumber: entry.blockNumber });
      break;
    }
  }
  // what arrived — minus the change and bought notes of this wallet's own spends
  for (const n of notes) {
    if (ownSpendTxs.has(n.txHash) && !n.fromSwap) continue;
    if (n.fromSwap && ownSpendTxs.has(n.txHash)) continue;
    activity.push({ kind: "received", token: n.token, amount: n.amount, txHash: n.txHash, blockNumber: n.blockNumber, fromSwap: n.fromSwap, leafIndex: n.leafIndex });
  }
  activity.sort((a, b) => b.blockNumber - a.blockNumber);

  return { notes, unspent: notes.filter((n) => !n.spent), balances, activity };
}

export { toBytes32 };
