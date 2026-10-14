import router from "./routes.js";
import { V1M } from "./config.js";
import { startIndexer } from "./indexer.js";
import { relayerIdentity, relayerBalance } from "./relayer.js";
import { connectV1MDatabase } from "./models.js";

/**
 * Menoid v1-mainnet backend, mounted next to the waitlist API.
 *
 *   mountV1Mainnet(app)   routes under /api/v1m
 *   startV1Mainnet()      its database, the relayer identity, then the indexer
 */

export function mountV1Mainnet(app) {
  app.use("/api/v1m", router);
}

export async function startV1Mainnet() {
  try {
    const db = await connectV1MDatabase();
    console.log(`✓ v1-mainnet database "${db.name}"`);
  } catch (error) {
    console.error(`✗ v1-mainnet database: ${error.message}`);
    return;
  }
  console.log(`✓ v1-mainnet: ${V1M.name} pool ${V1M.pool}`);
  try {
    const relayer = await relayerIdentity();
    const balance = await relayerBalance();
    console.log(
      `✓ v1-mainnet relayer ${relayer.address} (${balance} MON)` +
        (relayer.registered ? ", registered" : " — NOT REGISTERED on this pool: relaying is disabled")
    );
  } catch (error) {
    console.error(`✗ v1-mainnet relayer: ${error.message}`);
  }
  startIndexer();
}
