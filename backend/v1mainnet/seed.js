/**
 * Fill the V1mainnet.* collections from the chain, and keep a copy of the
 * protocol repo's end-to-end run for reference.
 *
 *   node v1mainnet/seed.js                     every chain
 *   node v1mainnet/seed.js base-sepolia        one chain
 *
 * The indexer would do the same on its own after the server starts; this
 * just does it now and reports what it found. Safe to run any number of
 * times: every write is an upsert on the event's own key.
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const { CHAINS, chainFor } = await import("./config.js");
const { serviceFor } = await import("./services.js");
const { V1mTestRun, connectV1MDatabase } = await import("./models.js");

// the protocol repo's e2e records, by chain
const E2E = {
  "monad-testnet": "../../menoid/evms/deployments/monadTestnet-e2e.json",
  "base-sepolia": "../../menoid/evms/deployments/baseSepoliaV1m-e2e.json",
};

const only = process.argv[2] ? chainFor(process.argv[2]) : null;
if (process.argv[2] && !only) throw new Error(`unknown chain "${process.argv[2]}"`);

const db = await connectV1MDatabase();
console.log(`✓ MongoDB connected (database "${db.name}")`);

for (const chain of only ? [only] : CHAINS) {
  const { indexer } = serviceFor(chain);
  const { head, trees } = await indexer.backfill();
  for (const t of trees) console.log(`  tree ${t.treeId}: ${t.leaves} leaves, root ${t.root} ${t.known ? "= a known pool root ✓" : "NOT KNOWN TO THE POOL ✗"}`);

  const e2eFile = path.resolve(E2E[chain.id] || "");
  if (E2E[chain.id] && fs.existsSync(e2eFile)) {
    const record = JSON.parse(fs.readFileSync(e2eFile, "utf8"));
    if (record.chainId !== chain.chainId || String(record.pool).toLowerCase() !== chain.pool.toLowerCase()) {
      console.log(`  skipped ${e2eFile}: it is for another pool`);
    } else {
      await V1mTestRun.updateOne(
        { chainId: chain.chainId, name: "protocol-e2e" },
        { $set: { record, importedAt: new Date() } },
        { upsert: true }
      );
      console.log(`  imported the e2e run (${record.steps.length} steps) into V1mainnet.testruns`);
    }
  }

  const status = await indexer.status();
  console.log(
    `  ${chain.name}: indexed to block ${status.indexedBlock} (chain head ${head}): ${status.notes} notes, ${status.nullifiers} nullifiers, ${status.registrations} registrations\n`
  );
}
await db.close();
process.exit(0);
