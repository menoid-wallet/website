/**
 * Menoid v1-mainnet protocol, in the browser.
 *
 * A line-for-line port of the protocol repo's evms/helpers (wallets.js,
 * commitments.js, encryption.js and the ext-data hashes in transactions.js).
 * Every byte here must match the circuits and the NoidPool contract, so
 * change nothing without changing it there too.
 */
import { ethers } from "ethers";
import { poseidon2, poseidon3, poseidon4 } from "poseidon-lite";
import { Base8, mulPointEscalar } from "@zk-kit/baby-jubjub";
import { encrypt as eciesEncrypt, decrypt as eciesDecrypt, ECIES_CONFIG } from "eciesjs";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { gcm } from "@noble/ciphers/aes";

// protocol constant: the ephemeral key travels compressed (33 bytes)
ECIES_CONFIG.isEphemeralKeyCompressed = true;

/* ─── constants ───────────────────────────────────────────────────────── */

export const FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
export const BABYJUB_SUBGROUP_ORDER = 2736030358979909402780800718157159386076813972158567259200215660948447373041n;
export const SECP256K1_ORDER = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

export const DOMAIN = { USER_COMMITMENT: 1n, NULLIFIER_KEY: 2n, NOTE_PUBLIC_KEY: 3n, COMMITMENT: 4n, NULLIFIER: 5n };

const KEY_TAGS = {
  SEED: "menoid/v1m/seed",
  SPEND: "menoid/v1m/spend",
  INCOMING: "menoid/v1m/incoming",
  OUTGOING: "menoid/v1m/outgoing",
  IVK: "menoid/v1m/ivk",
  OVK: "menoid/v1m/ovk",
};

export const EXT_DOMAIN = {
  TRANSFER: ethers.id("menoid.v1m.transfer"),
  WITHDRAW: ethers.id("menoid.v1m.withdraw"),
  SWAP: ethers.id("menoid.v1m.swap"),
};

export const TREE_DEPTH = 20;
export const CHUNK_SIZE = 4;
export const N_INS = 4;
export const MAX_AMOUNT = (1n << 128n) - 1n;

export const ACTION = { TRANSFER: 1, WITHDRAW: 2, SWAP: 3 } as const;
export const NOTE_FLAGS = { AMOUNT_FROM_EVENT: 1 } as const;

/* The key message names the network and the only origin that should ask for
   it. Mainnet and testnet keys are unrelated: the network is also mixed into
   the seed. */
export const KEY_NETWORKS = {
  mainnet: { label: "mainnet", origin: "https://app.menoid.xyz" },
  testnet: { label: "testnet", origin: "https://testnet.menoid.xyz" },
} as const;
export type KeyNetwork = keyof typeof KEY_NETWORKS;

/* ─── small helpers ───────────────────────────────────────────────────── */

export const toBytes32 = (value: bigint | string | number) => "0x" + BigInt(value).toString(16).padStart(64, "0");
const keccak = (types: string[], values: unknown[]) => ethers.solidityPackedKeccak256(types, values);
const hexToBytes = (hex: string) => ethers.getBytes(hex.startsWith("0x") ? hex : "0x" + hex);
const bytesToHex = (bytes: Uint8Array) => ethers.hexlify(bytes);

export function poseidonHash(inputs: bigint[]): bigint {
  const xs = inputs.map((x) => BigInt(x));
  if (xs.length === 2) return poseidon2(xs);
  if (xs.length === 3) return poseidon3(xs);
  if (xs.length === 4) return poseidon4(xs);
  throw new Error(`poseidon over ${xs.length} inputs is not used by the protocol`);
}

// 31 random bytes: always below the field size
export function randomFieldElement(): bigint {
  const bytes = new Uint8Array(31);
  globalThis.crypto.getRandomValues(bytes);
  return BigInt(bytesToHex(bytes));
}

/* ─── keys ────────────────────────────────────────────────────────────── */

export type ViewingKeys = { epoch: number; ivk: string; ivkPub: string; ovk: string };

export type PrivateKeys = {
  address: string;
  network: KeyNetwork;
  keyIndex: number;
  viewingEpoch: number;
  sk: bigint;
  spendPk: { x: bigint; y: bigint };
  nullifierKey: bigint;
  incomingSecret: string;
  outgoingSecret: string;
  viewing: ViewingKeys;
  userCommitment: bigint;
  userCommitmentBytes32: string;
};

export function keyMessage(network: KeyNetwork, keyIndex = 0): string {
  const n = KEY_NETWORKS[network];
  if (!n) throw new Error('key network must be "mainnet" or "testnet"');
  return [
    "Menoid: create my private account keys.",
    "",
    `Only sign this on ${n.origin}`,
    "Anyone holding this signature can spend your private balance.",
    "",
    `Network: ${n.label}`,
    `Key index: ${keyIndex}`,
  ].join("\n");
}

export function deriveIncomingViewingKey(incomingSecret: string, epoch: number) {
  const ivkHash = BigInt(keccak(["string", "bytes32", "uint32"], [KEY_TAGS.IVK, incomingSecret, epoch]));
  // map into [1, n-1] so it is always a valid secp256k1 private key
  const ivk = toBytes32((ivkHash % (SECP256K1_ORDER - 1n)) + 1n);
  const ivkPub = new ethers.SigningKey(ivk).publicKey; // 0x04 ‖ X ‖ Y
  return { ivk, ivkPub };
}

export function deriveOutgoingViewingKey(outgoingSecret: string, epoch: number): string {
  return keccak(["string", "bytes32", "uint32"], [KEY_TAGS.OVK, outgoingSecret, epoch]);
}

export function deriveViewingKeys(incomingSecret: string, outgoingSecret: string, epoch: number): ViewingKeys {
  return { epoch, ...deriveIncomingViewingKey(incomingSecret, epoch), ovk: deriveOutgoingViewingKey(outgoingSecret, epoch) };
}

export function userCommitmentOf(address: string, spendPk: { x: bigint; y: bigint }): bigint {
  return poseidonHash([DOMAIN.USER_COMMITMENT, BigInt(address), spendPk.x, spendPk.y]);
}

export function deriveKeysFromSignature(
  address: string,
  signature: string,
  { network, keyIndex = 0, viewingEpoch = 0 }: { network: KeyNetwork; keyIndex?: number; viewingEpoch?: number }
): PrivateKeys {
  if (!KEY_NETWORKS[network]) throw new Error('key network must be "mainnet" or "testnet"');
  // the network is mixed in as well as signed
  const seed = keccak(["string", "string", "bytes"], [KEY_TAGS.SEED, network, signature]);
  const sk = BigInt(keccak(["string", "bytes32"], [KEY_TAGS.SPEND, seed])) % BABYJUB_SUBGROUP_ORDER;
  const point = mulPointEscalar(Base8, sk);
  const spendPk = { x: BigInt(point[0]), y: BigInt(point[1]) };
  const nullifierKey = poseidonHash([DOMAIN.NULLIFIER_KEY, sk]);
  const incomingSecret = keccak(["string", "bytes32"], [KEY_TAGS.INCOMING, seed]);
  const outgoingSecret = keccak(["string", "bytes32"], [KEY_TAGS.OUTGOING, seed]);
  const userCommitment = userCommitmentOf(address, spendPk);
  return {
    address: ethers.getAddress(address),
    network,
    keyIndex,
    viewingEpoch,
    sk,
    spendPk,
    nullifierKey,
    incomingSecret,
    outgoingSecret,
    viewing: deriveViewingKeys(incomingSecret, outgoingSecret, viewingEpoch),
    userCommitment,
    userCommitmentBytes32: toBytes32(userCommitment),
  };
}

export function withViewingEpoch(keys: PrivateKeys, viewingEpoch: number): PrivateKeys {
  return { ...keys, viewingEpoch, viewing: deriveViewingKeys(keys.incomingSecret, keys.outgoingSecret, viewingEpoch) };
}

/* ─── notes ───────────────────────────────────────────────────────────── */

export type Note = { token: string; amount: bigint; owner: bigint; randomness: bigint; npk: bigint; commitment: bigint };

export const tokenField = (token: string) => BigInt(ethers.getAddress(token));
export const notePublicKey = (ownerUc: bigint, randomness: bigint) => poseidonHash([DOMAIN.NOTE_PUBLIC_KEY, ownerUc, randomness]);
export const noteCommitment = (token: string, amount: bigint, npk: bigint) => poseidonHash([DOMAIN.COMMITMENT, tokenField(token), BigInt(amount), npk]);
export const noteNullifier = (nk: bigint, commitment: bigint, randomness: bigint) => poseidonHash([DOMAIN.NULLIFIER, nk, commitment, randomness]);

export function createNote({ token, amount, owner, randomness = randomFieldElement() }: { token: string; amount: bigint; owner: bigint; randomness?: bigint }): Note {
  const npk = notePublicKey(owner, randomness);
  return { token: ethers.getAddress(token), amount: BigInt(amount), owner: BigInt(owner), randomness, npk, commitment: noteCommitment(token, amount, npk) };
}

/* ─── encrypted notes: ECIES to the owner's viewing key ───────────────────
   plaintext (70 B) = version(1) | flags(1) | token(20) | amount(16) | randomness(32) */

const NOTE_VERSION = 1;
const NOTE_PLAINTEXT_SIZE = 70;

function writeUint(buf: Uint8Array, offset: number, size: number, value: bigint) {
  const hex = BigInt(value).toString(16).padStart(size * 2, "0");
  if (hex.length > size * 2) throw new Error(`value does not fit in ${size} bytes`);
  buf.set(hexToBytes(hex), offset);
}
const readUint = (buf: Uint8Array, offset: number, size: number) => BigInt(bytesToHex(buf.subarray(offset, offset + size)));
const writeAddress = (buf: Uint8Array, offset: number, address: string) => buf.set(hexToBytes(ethers.getAddress(address)), offset);
const readAddress = (buf: Uint8Array, offset: number) => ethers.getAddress(bytesToHex(buf.subarray(offset, offset + 20)));

export type PlainNote = { flags: number; token: string; amount: bigint; randomness: bigint };

export function encodeNote({ token, amount, randomness, flags = 0 }: { token: string; amount: bigint; randomness: bigint; flags?: number }) {
  const buf = new Uint8Array(NOTE_PLAINTEXT_SIZE);
  buf[0] = NOTE_VERSION;
  buf[1] = flags;
  writeAddress(buf, 2, token);
  writeUint(buf, 22, 16, amount);
  writeUint(buf, 38, 32, randomness);
  return buf;
}

export function decodeNote(buf: Uint8Array): PlainNote {
  if (buf.length !== NOTE_PLAINTEXT_SIZE || buf[0] !== NOTE_VERSION) throw new Error("Unknown note format");
  return { flags: buf[1], token: readAddress(buf, 2), amount: readUint(buf, 22, 16), randomness: readUint(buf, 38, 32) };
}

export function encryptNote(viewingPublicKey: string, note: { token: string; amount: bigint; randomness: bigint; flags?: number }): string {
  return bytesToHex(eciesEncrypt(hexToBytes(viewingPublicKey), encodeNote(note)));
}

// trial decryption: null means "not encrypted to this key"
export function tryDecryptNote(ivk: string, ciphertext: string): PlainNote | null {
  try {
    return decodeNote(new Uint8Array(eciesDecrypt(hexToBytes(ivk), hexToBytes(ciphertext))));
  } catch {
    return null;
  }
}

/* ─── outgoing records: the sender's own record of a spend ────────────────
   key    = HKDF-SHA256(ovk, salt = firstNullifier, info = "menoid/v1m/outgoing-record")
   record = nonce(12) | AES-256-GCM(plaintext) | tag(16)
   plaintext (138 B) = version | action | token | amount(16) | fee(16)
                       | counterpartyAddress(20) | counterpartyUc(32) | counterpartyNoteRandomness(32) */

const OUTGOING_VERSION = 1;
const OUTGOING_PLAINTEXT_SIZE = 138;
const OUTGOING_INFO = new TextEncoder().encode("menoid/v1m/outgoing-record");

export type OutgoingRecord = {
  action: number;
  token: string;
  amount: bigint;
  fee: bigint;
  counterpartyAddress: string;
  counterpartyUserCommitment: bigint;
  counterpartyNoteRandomness: bigint;
  tokenOut?: string;
  minAmountOut?: bigint;
  outputRandomness?: bigint;
};

const outgoingKey = (ovk: string, firstNullifier: bigint) =>
  hkdf(sha256, hexToBytes(ovk), hexToBytes(toBytes32(firstNullifier)), OUTGOING_INFO, 32);

function encodeOutgoingRecord(r: Omit<OutgoingRecord, "tokenOut" | "minAmountOut" | "outputRandomness">) {
  const buf = new Uint8Array(OUTGOING_PLAINTEXT_SIZE);
  buf[0] = OUTGOING_VERSION;
  buf[1] = r.action;
  writeAddress(buf, 2, r.token);
  writeUint(buf, 22, 16, r.amount);
  writeUint(buf, 38, 16, r.fee);
  writeAddress(buf, 54, r.counterpartyAddress);
  writeUint(buf, 74, 32, r.counterpartyUserCommitment ?? 0n);
  writeUint(buf, 106, 32, r.counterpartyNoteRandomness ?? 0n);
  return buf;
}

function decodeOutgoingRecord(buf: Uint8Array): OutgoingRecord {
  if (buf.length !== OUTGOING_PLAINTEXT_SIZE || buf[0] !== OUTGOING_VERSION) throw new Error("Unknown record format");
  const record: OutgoingRecord = {
    action: buf[1],
    token: readAddress(buf, 2),
    amount: readUint(buf, 22, 16),
    fee: readUint(buf, 38, 16),
    counterpartyAddress: readAddress(buf, 54),
    counterpartyUserCommitment: readUint(buf, 74, 32),
    counterpartyNoteRandomness: readUint(buf, 106, 32),
  };
  if (record.action === ACTION.SWAP) {
    record.tokenOut = record.counterpartyAddress;
    record.minAmountOut = record.counterpartyUserCommitment;
    record.outputRandomness = record.counterpartyNoteRandomness;
  }
  return record;
}

export function encryptOutgoingRecord(
  ovk: string,
  firstNullifier: bigint,
  record: { action: number; token: string; amount: bigint; fee: bigint; counterpartyAddress: string; counterpartyUserCommitment?: bigint; counterpartyNoteRandomness?: bigint }
): string {
  const nonce = new Uint8Array(12);
  globalThis.crypto.getRandomValues(nonce);
  const sealed = gcm(outgoingKey(ovk, firstNullifier), nonce).encrypt(
    encodeOutgoingRecord({ counterpartyUserCommitment: 0n, counterpartyNoteRandomness: 0n, ...record })
  ); // body ‖ tag
  const out = new Uint8Array(12 + sealed.length);
  out.set(nonce, 0);
  out.set(sealed, 12);
  return bytesToHex(out);
}

export function tryDecryptOutgoingRecord(ovk: string, firstNullifier: bigint, recordHex: string): OutgoingRecord | null {
  try {
    const raw = hexToBytes(recordHex);
    const plain = gcm(outgoingKey(ovk, firstNullifier), raw.subarray(0, 12)).decrypt(raw.subarray(12));
    return decodeOutgoingRecord(plain);
  } catch {
    return null;
  }
}

/* ─── ext data hashes — must match NoidPool.hash*ExtData ──────────────── */

const coder = ethers.AbiCoder.defaultAbiCoder();

export type TransferExt = { encryptedOutputs: [string, string, string]; outgoingRecord: string };
export type WithdrawExt = { recipient: string; unwrapNative: boolean; encryptedOutputs: [string, string]; outgoingRecord: string };
export type SwapExt = {
  adapter: string;
  tokenOut: string;
  minAmountOut: bigint;
  deadline: bigint;
  npkOut: string;
  routeData: string;
  encryptedOutput: string;
  encryptedOutputs: [string, string];
  outgoingRecord: string;
};

export function hashTransferExtData(chainId: number, pool: string, ext: TransferExt): bigint {
  const encoded = coder.encode(
    ["uint256", "address", "bytes32", "tuple(bytes[3] encryptedOutputs, bytes outgoingRecord)"],
    [chainId, pool, EXT_DOMAIN.TRANSFER, [ext.encryptedOutputs, ext.outgoingRecord]]
  );
  return BigInt(ethers.keccak256(encoded)) % FIELD_SIZE;
}

export function hashWithdrawExtData(chainId: number, pool: string, ext: WithdrawExt): bigint {
  const encoded = coder.encode(
    ["uint256", "address", "bytes32", "tuple(address recipient, bool unwrapNative, bytes[2] encryptedOutputs, bytes outgoingRecord)"],
    [chainId, pool, EXT_DOMAIN.WITHDRAW, [ext.recipient, ext.unwrapNative, ext.encryptedOutputs, ext.outgoingRecord]]
  );
  return BigInt(ethers.keccak256(encoded)) % FIELD_SIZE;
}

export function hashSwapExtData(chainId: number, pool: string, ext: SwapExt): bigint {
  const encoded = coder.encode(
    [
      "uint256",
      "address",
      "bytes32",
      "tuple(address adapter, address tokenOut, uint256 minAmountOut, uint256 deadline, bytes32 npkOut, bytes routeData, bytes encryptedOutput, bytes[2] encryptedOutputs, bytes outgoingRecord)",
    ],
    [
      chainId,
      pool,
      EXT_DOMAIN.SWAP,
      [ext.adapter, ext.tokenOut, ext.minAmountOut, ext.deadline, ext.npkOut, ext.routeData, ext.encryptedOutput, ext.encryptedOutputs, ext.outgoingRecord],
    ]
  );
  return BigInt(ethers.keccak256(encoded)) % FIELD_SIZE;
}
