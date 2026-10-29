import router from "./routes.js";
import { allServices } from "./services.js";
import { connectV1MDatabase } from "./models.js";

/**
 * Menoid v1-mainnet backend, mounted on the website's API server.
 *
 *   mountV1Mainnet(app)   routes under /api/v1m; the database opens on the
 *                         first request and stays open for the next ones
 *   startV1Mainnet()      a long-running server (local): the database, then
 *                         for every chain the relayer identity and the
 *                         indexer loop
 *
 * On Vercel (or with V1M_ON_DEMAND=1) no loop runs: each chain's indexer
 * catches up when asked, through GET /api/v1m/catch-up (UptimeRobot, every 5
 * minutes) and before /sync and /status answer (routes.js). Prices are read
 * when the app asks and cached for a minute (market.js), never on a timer.
 */

export const ON_DEMAND = Boolean(process.env.VERCEL) || process.env.V1M_ON_DEMAND === "1";

// every /api/v1m request waits for the database (opened once per instance)
async function ensureDatabase(_req, res, next) {
  try {
    await connectV1MDatabase();
    next();
  } catch (error) {
    console.error(`✗ v1-mainnet database: ${error.message}`);
    res.status(503).json({ error: "database unavailable, try again" });
  }
}

export function mountV1Mainnet(app) {
  app.use("/api/v1m", ensureDatabase, router);
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
    const { chain, relayer, indexer } = service;
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
    if (!ON_DEMAND) indexer.start();
  }
  if (ON_DEMAND) console.log("  indexers on demand: GET /api/v1m/catch-up");
}
