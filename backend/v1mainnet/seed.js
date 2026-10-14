/**
 * Fill the V1mainnet.* collections from the chain, and keep a copy of the
 * protocol repo's end-to-end run for reference.
 *
 *   node v1mainnet/seed.js [path/to/monadTestnet-e2e.json]
 *
 * The indexer would do the same on its own after the server starts; this
 * just does it now and reports what it found. Safe to run any number of
 * times: every write is an upsert on the event's own key.
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const { V1M } = await import("./config.js");
const { backfill, indexerStatus } = await import("./indexer.js");
const { V1mTestRun, connectV1MDatabase } = await import("./models.js");

const e2eFile = process.argv[2] || path.resolve("../../menoid/evms/deployments/monadTestnet-e2e.json");

const db = await connectV1MDatabase();
console.log(`✓ MongoDB connected (database "${db.name}")`);

const { head, trees } = await backfill();
for (const t of trees) console.log(`  tree ${t.treeId}: ${t.leaves} leaves, root ${t.root} ${t.known ? "= a known pool root ✓" : "NOT KNOWN TO THE POOL ✗"}`);

if (fs.existsSync(e2eFile)) {
  const record = JSON.parse(fs.readFileSync(e2eFile, "utf8"));
  if (record.chainId !== V1M.chainId || String(record.pool).toLowerCase() !== V1M.pool.toLowerCase()) {
    console.log(`  skipped ${e2eFile}: it is for another pool`);
  } else {
    await V1mTestRun.updateOne(
      { chainId: V1M.chainId, name: "protocol-e2e" },
      { $set: { record, importedAt: new Date() } },
      { upsert: true }
    );
    console.log(`  imported the e2e run (${record.steps.length} steps) into V1mainnet.testruns`);
  }
} else {
  console.log(`  no e2e record at ${e2eFile}`);
}

const status = await indexerStatus();
console.log(
  `\nindexed to block ${status.indexedBlock} (chain head ${head}): ${status.notes} notes, ${status.nullifiers} nullifiers, ${status.registrations} registrations`
);
await db.close();
