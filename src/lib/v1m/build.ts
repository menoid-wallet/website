/**
 * Builders for the pool actions, as the protocol repo's helpers/transactions.js
 * writes them. Output order is part of the protocol: the relayer reads its fee
 * from outputs[2] of a transfer and outputs[1] of a withdraw or swap.
 */
import { ethers } from "ethers";

import {
  ACTION,
  N_INS,
  NOTE_FLAGS,
  TREE_DEPTH,
  createNote,
  encryptNote,
  encryptOutgoingRecord,
  hashSwapExtData,
  hashTransferExtData,
  hashWithdrawExtData,
  noteCommitment,
  noteNullifier,
  notePublicKey,
  randomFieldElement,
  toBytes32,
  tokenField,
  type PrivateKeys,
} from "./protocol.ts";
import type { Mirror, OwnedNote } from "./mirror.ts";

export type Recipient = { address: string; userCommitment: bigint; viewingPublicKey: string };
export type SolidityProof = { a: [string, string]; b: [[string, string], [string, string]]; c: [string, string] };
export type Prover = (circuit: "transfer" | "withdraw", input: Record<string, unknown>) => Promise<SolidityProof>;

/* ─── deposit: no proof; the contract computes the commitment ──────────── */

export function buildDeposit({ token, amount, recipient }: { token: string; amount: bigint; recipient: Recipient }) {
  const note = createNote({ token, amount, owner: recipient.userCommitment });
  return { note, npk: toBytes32(note.npk), encryptedNote: encryptNote(recipient.viewingPublicKey, note) };
}

/* ─── shared spend preparation ─────────────────────────────────────────── */

type Slot = { amount: bigint; randomness: bigint; commitment: bigint; pathElements: bigint[]; pathIndices: number[] };

export function prepareInputs({ mirror, owner, notes, token }: { mirror: Mirror; owner: PrivateKeys; notes: OwnedNote[]; token: string }) {
  if (notes.length === 0 || notes.length > N_INS) throw new Error(`a proof spends 1 to ${N_INS} notes`);
  const treeId = notes[0].treeId;
  for (const note of notes) {
    if (note.treeId !== treeId) throw new Error("all inputs of one proof must be in the same tree");
    if (ethers.getAddress(note.token) !== ethers.getAddress(token)) throw new Error("all inputs of one proof must be the same token");
  }
  const root = mirror.root(treeId);
  const slots: Slot[] = notes.map((note) => {
    const path = mirror.merkleProof(treeId, note.leafIndex);
    if (path.leaf !== note.commitment) throw new Error(`leaf ${note.leafIndex} is not this note`);
    return { amount: note.amount, randomness: note.randomness, commitment: note.commitment, pathElements: path.pathElements, pathIndices: path.pathIndices };
  });
  // zero-value dummies fill the rest; the circuit exempts them from the Merkle check
  while (slots.length < N_INS) {
    const randomness = randomFieldElement();
    slots.push({
      amount: 0n,
      randomness,
      commitment: noteCommitment(token, 0n, notePublicKey(owner.userCommitment, randomness)),
      pathElements: new Array(TREE_DEPTH).fill(0n),
      pathIndices: new Array(TREE_DEPTH).fill(0),
    });
  }
  return {
    treeId,
    root,
    slots,
    nullifiers: slots.map((s) => noteNullifier(owner.nullifierKey, s.commitment, s.randomness)),
    total: notes.reduce((sum, n) => sum + n.amount, 0n),
  };
}

function spendInput(args: { owner: PrivateKeys; root: bigint; slots: Slot[]; nullifiers: bigint[]; outputs: ReturnType<typeof createNote>[]; relayer: Recipient; extDataHash: bigint }) {
  const { owner, root, slots, nullifiers, outputs, relayer, extDataHash } = args;
  return {
    root,
    nullifiers,
    outCommitments: outputs.map((o) => o.commitment),
    relayer: relayer.userCommitment,
    extDataHash,
    sk: owner.sk,
    ownerAddress: BigInt(owner.address),
    inAmounts: slots.map((s) => s.amount),
    inRandomness: slots.map((s) => s.randomness),
    inPathElements: slots.map((s) => s.pathElements),
    inPathIndices: slots.map((s) => s.pathIndices),
    outAmounts: outputs.map((o) => o.amount),
    outRandomness: outputs.map((o) => o.randomness),
    outOwners: outputs.map((o) => o.owner),
  };
}

type SpendBase = { chainId: number; pool: string; mirror: Mirror; sender: PrivateKeys; notes: OwnedNote[]; relayer: Recipient; fee: bigint; prove: Prover };

/* ─── transfer ─────────────────────────────────────────────────────────── */

export async function buildTransfer(args: SpendBase & { token: string; recipient: Recipient; amount: bigint }) {
  const { chainId, pool, mirror, sender, notes, token, recipient, amount, relayer, fee, prove } = args;
  if (!recipient.userCommitment) throw new Error(`${recipient.address} is not registered for private transfers`);
  const { treeId, root, slots, nullifiers, total } = prepareInputs({ mirror, owner: sender, notes, token });
  const change = total - amount - fee;
  if (change < 0n) throw new Error("these notes do not cover the amount and the fee");

  const outputs = [
    createNote({ token, amount, owner: recipient.userCommitment }),
    createNote({ token, amount: change, owner: sender.userCommitment }),
    createNote({ token, amount: fee, owner: relayer.userCommitment }),
  ];
  const ext = {
    encryptedOutputs: [
      encryptNote(recipient.viewingPublicKey, outputs[0]),
      encryptNote(sender.viewing.ivkPub, outputs[1]),
      encryptNote(relayer.viewingPublicKey, outputs[2]),
    ] as [string, string, string],
    outgoingRecord: encryptOutgoingRecord(sender.viewing.ovk, nullifiers[0], {
      action: ACTION.TRANSFER,
      token,
      amount,
      fee,
      counterpartyAddress: recipient.address,
      counterpartyUserCommitment: recipient.userCommitment,
      counterpartyNoteRandomness: outputs[0].randomness,
    }),
  };
  const extDataHash = hashTransferExtData(chainId, pool, ext);
  const proof = await prove("transfer", { ...spendInput({ owner: sender, root, slots, nullifiers, outputs, relayer, extDataHash }), token: tokenField(token) });
  return {
    call: {
      proof,
      treeId,
      root: toBytes32(root),
      nullifiers: nullifiers.map(toBytes32),
      outCommitments: outputs.map((o) => toBytes32(o.commitment)),
      relayer: toBytes32(relayer.userCommitment),
      ext,
    },
    outputs,
    nullifiers,
  };
}

/* ─── withdraw (unmask, or a send to an unregistered address) ──────────── */

export async function buildWithdraw(args: SpendBase & { token: string; amount: bigint; to: string; unwrapNative?: boolean }) {
  const { chainId, pool, mirror, sender, notes, token, amount, to, unwrapNative = false, relayer, fee, prove } = args;
  const { treeId, root, slots, nullifiers, total } = prepareInputs({ mirror, owner: sender, notes, token });
  const change = total - amount - fee;
  if (change < 0n) throw new Error("these notes do not cover the amount and the fee");

  const outputs = [createNote({ token, amount: change, owner: sender.userCommitment }), createNote({ token, amount: fee, owner: relayer.userCommitment })];
  const recipientAddress = ethers.getAddress(to);
  const ext = {
    recipient: recipientAddress,
    unwrapNative,
    encryptedOutputs: [encryptNote(sender.viewing.ivkPub, outputs[0]), encryptNote(relayer.viewingPublicKey, outputs[1])] as [string, string],
    outgoingRecord: encryptOutgoingRecord(sender.viewing.ovk, nullifiers[0], {
      action: ACTION.WITHDRAW,
      token,
      amount,
      fee,
      counterpartyAddress: recipientAddress,
    }),
  };
  const extDataHash = hashWithdrawExtData(chainId, pool, ext);
  const proof = await prove("withdraw", {
    ...spendInput({ owner: sender, root, slots, nullifiers, outputs, relayer, extDataHash }),
    publicToken: tokenField(token),
    publicAmount: amount,
  });
  return {
    call: {
      proof,
      treeId,
      root: toBytes32(root),
      nullifiers: nullifiers.map(toBytes32),
      outCommitments: outputs.map((o) => toBytes32(o.commitment)),
      relayer: toBytes32(relayer.userCommitment),
      token: ethers.getAddress(token),
      amount,
      ext,
    },
    outputs,
    nullifiers,
  };
}

/* ─── swap: the pool trades on Uniswap V3, then finishes the bought note ── */

export async function buildSwap(
  args: SpendBase & { tokenIn: string; amountIn: bigint; tokenOut: string; minAmountOut: bigint; adapter: string; routeData: string; deadline: bigint }
) {
  const { chainId, pool, mirror, sender, notes, tokenIn, amountIn, tokenOut, minAmountOut, adapter, routeData, deadline, relayer, fee, prove } = args;
  if (minAmountOut <= 0n) throw new Error("a swap needs a minimum output");
  const { treeId, root, slots, nullifiers, total } = prepareInputs({ mirror, owner: sender, notes, token: tokenIn });
  const change = total - amountIn - fee;
  if (change < 0n) throw new Error("these notes do not cover the amount and the fee");

  const outputs = [createNote({ token: tokenIn, amount: change, owner: sender.userCommitment }), createNote({ token: tokenIn, amount: fee, owner: relayer.userCommitment })];
  // the bought note: its owner is fixed now, its amount filled in by the pool
  const outputRandomness = randomFieldElement();
  const npkOut = notePublicKey(sender.userCommitment, outputRandomness);
  const ext = {
    adapter: ethers.getAddress(adapter),
    tokenOut: ethers.getAddress(tokenOut),
    minAmountOut,
    deadline,
    npkOut: toBytes32(npkOut),
    routeData,
    encryptedOutput: encryptNote(sender.viewing.ivkPub, { token: tokenOut, amount: 0n, randomness: outputRandomness, flags: NOTE_FLAGS.AMOUNT_FROM_EVENT }),
    encryptedOutputs: [encryptNote(sender.viewing.ivkPub, outputs[0]), encryptNote(relayer.viewingPublicKey, outputs[1])] as [string, string],
    outgoingRecord: encryptOutgoingRecord(sender.viewing.ovk, nullifiers[0], {
      action: ACTION.SWAP,
      token: tokenIn,
      amount: amountIn,
      fee,
      counterpartyAddress: tokenOut,
      counterpartyUserCommitment: minAmountOut,
      counterpartyNoteRandomness: outputRandomness,
    }),
  };
  const extDataHash = hashSwapExtData(chainId, pool, ext);
  const proof = await prove("withdraw", {
    ...spendInput({ owner: sender, root, slots, nullifiers, outputs, relayer, extDataHash }),
    publicToken: tokenField(tokenIn),
    publicAmount: amountIn,
  });
  return {
    call: {
      proof,
      treeId,
      root: toBytes32(root),
      nullifiers: nullifiers.map(toBytes32),
      outCommitments: outputs.map((o) => toBytes32(o.commitment)),
      relayer: toBytes32(relayer.userCommitment),
      tokenIn: ethers.getAddress(tokenIn),
      amountIn,
      ext,
    },
    outputs,
    nullifiers,
  };
}

/* ─── note selection ───────────────────────────────────────────────────── */

/** Largest notes first, at most 4 (one proof). Throws if they cannot cover it. */
export function pickNotes(unspent: OwnedNote[], token: string, needed: bigint): OwnedNote[] {
  const candidates = unspent
    .filter((n) => ethers.getAddress(n.token) === ethers.getAddress(token))
    .sort((a, b) => (b.amount > a.amount ? 1 : b.amount < a.amount ? -1 : 0));
  const byTree = new Map<number, OwnedNote[]>();
  for (const n of candidates) byTree.set(n.treeId, [...(byTree.get(n.treeId) || []), n]);
  for (const list of byTree.values()) {
    const picked: OwnedNote[] = [];
    let total = 0n;
    for (const n of list.slice(0, N_INS)) {
      if (total >= needed) break;
      picked.push(n);
      total += n.amount;
    }
    if (total >= needed) return picked;
  }
  throw new Error("Your private notes cannot cover this in one transaction yet");
}

/* ─── batches: more than 4 notes, several proofs, one transaction ───────
   A proof spends at most 4 notes. A bigger payment is split into several
   proofs relayed together; each pays the relayer its own fee note. */

export const MAX_CALLS = 4;

export type Batch = { notes: OwnedNote[]; amount: bigint };

const ofToken = (unspent: OwnedNote[], token: string) =>
  unspent
    .filter((n) => ethers.getAddress(n.token) === ethers.getAddress(token))
    .sort((a, b) => (b.amount > a.amount ? 1 : b.amount < a.amount ? -1 : 0));

/** How many proofs a payment needs at `feePerCall` each (largest notes first). */
export function callsNeeded(unspent: OwnedNote[], token: string, amount: bigint, feePerCall: bigint, maxCalls = MAX_CALLS): number | null {
  const notes = ofToken(unspent, token);
  let total = 0n;
  for (let i = 0; i < notes.length && i < maxCalls * N_INS; i++) {
    total += notes[i].amount;
    const calls = Math.ceil((i + 1) / N_INS);
    if (total >= amount + feePerCall * BigInt(calls)) return calls;
  }
  return null;
}

/** Split `amount` into proofs of up to 4 notes; every proof can pay its fee. */
export function planBatches(unspent: OwnedNote[], token: string, amount: bigint, feePerCall: bigint, maxCalls = MAX_CALLS): Batch[] {
  const notes = ofToken(unspent, token);
  let picked: OwnedNote[] | null = null;
  let total = 0n;
  for (let i = 0; i < notes.length && i < maxCalls * N_INS; i++) {
    total += notes[i].amount;
    if (total >= amount + feePerCall * BigInt(Math.ceil((i + 1) / N_INS))) {
      picked = notes.slice(0, i + 1);
      break;
    }
  }
  if (!picked) throw new Error("Your private notes cannot cover this yet");
  const calls = Math.ceil(picked.length / N_INS);

  // deal the notes out, biggest first to the lightest proof, so each can pay its fee
  const groups = Array.from({ length: calls }, () => ({ notes: [] as OwnedNote[], total: 0n }));
  for (const note of picked) {
    const open = groups.filter((g) => g.notes.length < N_INS).sort((a, b) => (a.total < b.total ? -1 : a.total > b.total ? 1 : 0));
    open[0].notes.push(note);
    open[0].total += note.amount;
  }
  // each proof carries a share of the amount in proportion to what it can carry after its fee
  const capacity = groups.map((g) => g.total - feePerCall);
  if (capacity.some((c) => c <= 0n)) throw new Error("Your private notes cannot cover this yet");
  const totalCapacity = capacity.reduce((s, c) => s + c, 0n);
  const shares = capacity.map((c) => (amount * c) / totalCapacity);
  let left = amount - shares.reduce((s, a) => s + a, 0n);
  for (let i = 0; left > 0n && i < shares.length; i++) {
    const room = capacity[i] - shares[i];
    const add = room < left ? room : left;
    shares[i] += add;
    left -= add;
  }
  return groups.map((g, i) => ({ notes: g.notes, amount: shares[i] })).filter((b) => b.amount > 0n);
}

/** The most one transaction can move: up to MAX_CALLS proofs of 4 notes, minus their fees. */
export function maxSpendable(unspent: OwnedNote[], token: string, feePerCall: bigint, maxCalls = MAX_CALLS): bigint {
  const notes = ofToken(unspent, token);
  let best = 0n;
  let total = 0n;
  for (let i = 0; i < notes.length && i < maxCalls * N_INS; i++) {
    total += notes[i].amount;
    const net = total - feePerCall * BigInt(Math.ceil((i + 1) / N_INS));
    if (net > best) best = net;
  }
  return best;
}
