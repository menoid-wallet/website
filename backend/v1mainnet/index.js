import router from "./routes.js";
import { allServices } from "./services.js";
import { connectV1MDatabase } from "./models.js";

/**
 * Menoid v1-mainnet backend, mounted next to the waitlist API.
 *
 *   mountV1Mainnet(app)   routes under /api/v1m
 *   startV1Mainnet()      its database, then for every chain the relayer
 *                         identity, the indexer and the price feed
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
  for (const service of allServices()) {
    const { chain, relayer, indexer, market } = service;
    console.log(`✓ v1-mainnet ${chain.name}: pool ${chain.pool}`);
    try {
      const id = await relayer.relayerIdentity();
      const balance = await relayer.relayerBalance();
      console.log(
        `  relayer ${id.address} (${balance} ${chain.nativeSymbol})` +
          (id.registered ? ", registered" : " — NOT REGISTERED on this pool: relaying is disabled")
      );
    } catch (error) {
      console.error(`✗ v1-mainnet ${chain.name} relayer: ${error.message}`);
    }
    indexer.start();
    market.startPriceRefresher();
  }
}
