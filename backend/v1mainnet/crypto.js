import { ethers } from "ethers";
import { buildPoseidon, buildBabyjub } from "circomlibjs";
import { decrypt, ECIES_CONFIG } from "eciesjs";

/**
 * The parts of the v1-mainnet protocol the backend needs: the relayer derives
 * its own keys (to open the fee notes paid to it) and checks that a fee note
 * really is a note for the relayer. Byte-for-byte the protocol repo's
 * helpers/wallets.js, commitments.js and encryption.js.
 */

ECIES_CONFIG.isEphemeralKeyCompressed = true;

const BABYJUB_SUBGROUP_ORDER = 2736030358979909402780800718157159386076813972158567259200215660948447373041n;
const SECP256K1_ORDER = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;

export const DOMAIN = { USER_COMMITMENT: 1n, NULLIFIER_KEY: 2n, NOTE_PUBLIC_KEY: 3n, COMMITMENT: 4n, NULLIFIER: 5n };

const KEY_TAGS = {
  SEED: "menoid/v1m/seed",
  SPEND: "menoid/v1m/spend",
  INCOMING: "menoid/v1m/incoming",
  OUTGOING: "menoid/v1m/outgoing",
  IVK: "menoid/v1m/ivk",
  OVK: "menoid/v1m/ovk",
};

export const KEY_NETWORKS = {
  mainnet: { label: "mainnet", origin: "https://app.menoid.xyz" },
  testnet: { label: "testnet", origin: "https://testnet.menoid.xyz" },
};

let poseidon = null;
let babyJub = null;

export async function initCrypto() {
  if (!poseidon) poseidon = await buildPoseidon();
  if (!babyJub) babyJub = await buildBabyjub();
}

export function poseidonHash(inputs) {
  return BigInt(poseidon.F.toString(poseidon(inputs.map((x) => BigInt(x)))));
}

const keccak = (types, values) => ethers.solidityPackedKeccak256(types, values);
const hex32 = (value) => "0x" + BigInt(value).toString(16).padStart(64, "0");

export function keyMessage({ network, keyIndex = 0 }) {
  const n = KEY_NETWORKS[network];
  if (!n) throw new Error(`key network must be "mainnet" or "testnet"`);
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

export function deriveKeysFromSignature(address, signature, { network, keyIndex = 0, viewingEpoch = 0 }) {
  if (!KEY_NETWORKS[network]) throw new Error(`key network must be "mainnet" or "testnet"`);
  const seed = keccak(["string", "string", "bytes"], [KEY_TAGS.SEED, network, signature]);
  const sk = BigInt(keccak(["string", "bytes32"], [KEY_TAGS.SPEND, seed])) % BABYJUB_SUBGROUP_ORDER;
  const point = babyJub.mulPointEscalar(babyJub.Base8, sk);
  const spendPk = { x: BigInt(babyJub.F.toString(point[0])), y: BigInt(babyJub.F.toString(point[1])) };
  const incomingSecret = keccak(["string", "bytes32"], [KEY_TAGS.INCOMING, seed]);
  const outgoingSecret = keccak(["string", "bytes32"], [KEY_TAGS.OUTGOING, seed]);
  const ivkHash = BigInt(keccak(["string", "bytes32", "uint32"], [KEY_TAGS.IVK, incomingSecret, viewingEpoch]));
  const ivk = hex32((ivkHash % (SECP256K1_ORDER - 1n)) + 1n);
  const userCommitment = poseidonHash([DOMAIN.USER_COMMITMENT, BigInt(address), spendPk.x, spendPk.y]);
  return {
    address: ethers.getAddress(address),
    network,
    keyIndex,
    viewingEpoch,
    userCommitment,
    userCommitmentBytes32: hex32(userCommitment),
    ivk,
    ivkPub: new ethers.SigningKey(ivk).publicKey,
  };
}

export const notePublicKey = (ownerUc, randomness) => poseidonHash([DOMAIN.NOTE_PUBLIC_KEY, ownerUc, randomness]);
export const noteCommitment = (token, amount, npk) => poseidonHash([DOMAIN.COMMITMENT, BigInt(ethers.getAddress(token)), BigInt(amount), npk]);

const NOTE_PLAINTEXT_SIZE = 70;

// trial decryption of a note encrypted to `ivk`; null if it is not ours
export function tryDecryptNote(ivk, ciphertext) {
  try {
    const plain = Buffer.from(decrypt(Buffer.from(ivk.slice(2), "hex"), Buffer.from(ciphertext.replace(/^0x/, ""), "hex")));
    if (plain.length !== NOTE_PLAINTEXT_SIZE || plain[0] !== 1) return null;
    return {
      flags: plain[1],
      token: ethers.getAddress("0x" + plain.subarray(2, 22).toString("hex")),
      amount: BigInt("0x" + plain.subarray(22, 38).toString("hex")),
      randomness: BigInt("0x" + plain.subarray(38, 70).toString("hex")),
    };
  } catch {
    return null;
  }
}
