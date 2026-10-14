import mongoose from "mongoose";

/**
 * Menoid v1-mainnet collections, all under the "V1mainnet." prefix so they
 * never mix with the waitlist (or the V1 demo's relayer database).
 *
 * Everything here is PUBLIC chain data, copied so the website can sync a
 * wallet in one request instead of thousands of 100-block eth_getLogs calls.
 * The chain stays the source of truth: the browser recomputes every note it
 * decrypts and checks the Merkle root against the contract before proving.
 *
 * `seq` = blockNumber * 100000 + logIndex: one ordering for every event, so a
 * client syncs with a single cursor.
 */

const { Schema } = mongoose;

/* Its own connection and database (V1M_DB_NAME, default "menoid_v1mainnet"),
   so nothing here shares a database with the waitlist or the V1 demo. Models
   are bound to it now; queries wait until connectV1MDatabase() opens it. */
export const v1mDb = mongoose.createConnection();

export async function connectV1MDatabase() {
  const uri = process.env.V1M_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("V1M_MONGODB_URI is not set");
  if (v1mDb.readyState === 0) {
    await v1mDb.openUri(uri, { dbName: process.env.V1M_DB_NAME || "menoid_v1mainnet" });
  }
  return v1mDb;
}
const opts = (collection) => ({ collection, versionKey: false, timestamps: false });

const noteSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    treeId: { type: Number, required: true },
    leafIndex: { type: Number, required: true },
    commitment: { type: String, required: true },
    encryptedNote: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    txHash: { type: String, required: true },
    seq: { type: Number, required: true },
  },
  opts("V1mainnet.notes")
);
noteSchema.index({ chainId: 1, treeId: 1, leafIndex: 1 }, { unique: true });
noteSchema.index({ chainId: 1, seq: 1 });

const nullifierSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    nullifier: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    txHash: { type: String, required: true },
    seq: { type: Number, required: true },
  },
  opts("V1mainnet.nullifiers")
);
nullifierSchema.index({ chainId: 1, nullifier: 1 }, { unique: true });
nullifierSchema.index({ chainId: 1, seq: 1 });

// the sender's own encrypted record of a spend, keyed by its first nullifier
const outgoingSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    firstNullifier: { type: String, required: true },
    record: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    txHash: { type: String, required: true },
    seq: { type: Number, required: true },
  },
  opts("V1mainnet.outgoing")
);
outgoingSchema.index({ chainId: 1, firstNullifier: 1 }, { unique: true });
outgoingSchema.index({ chainId: 1, seq: 1 });

// a swap's bought note: its amount is only known from this event
const swapSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    commitment: { type: String, required: true },
    tokenIn: { type: String, required: true },
    tokenOut: { type: String, required: true },
    amountIn: { type: String, required: true },
    amountOut: { type: String, required: true },
    adapter: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    txHash: { type: String, required: true },
    seq: { type: Number, required: true },
  },
  opts("V1mainnet.swaps")
);
swapSchema.index({ chainId: 1, commitment: 1 }, { unique: true });
swapSchema.index({ chainId: 1, seq: 1 });

// registrationOf(address), as of the latest Registered / ViewingKeyUpdated / KeysRotated
const registrationSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    address: { type: String, required: true },
    userCommitment: { type: String, required: true },
    viewingPublicKey: { type: String, required: true },
    keyIndex: { type: Number, default: 0 },
    viewingEpoch: { type: Number, default: 0 },
    registeredBlock: { type: Number },
    updatedBlock: { type: Number },
    txHash: { type: String },
    seq: { type: Number },
  },
  opts("V1mainnet.registrations")
);
registrationSchema.index({ chainId: 1, address: 1 }, { unique: true });

const stateSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    key: { type: String, required: true },
    lastBlock: { type: Number, default: 0 },
    treeId: { type: Number, default: 0 },
    root: { type: String, default: null },
    leaves: { type: Number, default: 0 },
    rootVerified: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  opts("V1mainnet.state")
);
stateSchema.index({ chainId: 1, key: 1 }, { unique: true });

/* What the relayer did. Counts, timings and public outcomes only: no
   recipients of private transfers, no note contents. The fee is recorded
   because the relayer itself is the one paid it. */
const relaySchema = new Schema(
  {
    chainId: { type: Number, required: true },
    kind: { type: String, enum: ["transfer", "withdraw", "swap"], required: true },
    calls: { type: Number, default: 1 },
    status: { type: String, enum: ["submitted", "confirmed", "reverted", "rejected"], required: true },
    txHash: { type: String },
    gasEstimate: { type: String },
    gasLimit: { type: String },
    feeToken: { type: String },
    feeAmount: { type: String },
    reason: { type: String },
    durationMs: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  opts("V1mainnet.relays")
);
relaySchema.index({ chainId: 1, createdAt: -1 });

// the protocol repo's end-to-end runs, kept for reference (labels, tx hashes)
const testRunSchema = new Schema(
  {
    chainId: { type: Number, required: true },
    name: { type: String, required: true },
    importedAt: { type: Date, default: Date.now },
    record: { type: Schema.Types.Mixed, required: true },
  },
  opts("V1mainnet.testruns")
);
testRunSchema.index({ chainId: 1, name: 1 }, { unique: true });

const model = (name, schema) => v1mDb.models[name] || v1mDb.model(name, schema);

export const V1mNote = model("V1mNote", noteSchema);
export const V1mNullifier = model("V1mNullifier", nullifierSchema);
export const V1mOutgoing = model("V1mOutgoing", outgoingSchema);
export const V1mSwap = model("V1mSwap", swapSchema);
export const V1mRegistration = model("V1mRegistration", registrationSchema);
export const V1mState = model("V1mState", stateSchema);
export const V1mRelay = model("V1mRelay", relaySchema);
export const V1mTestRun = model("V1mTestRun", testRunSchema);

export const seqOf = (blockNumber, logIndex) => Number(blockNumber) * 100000 + Number(logIndex);
