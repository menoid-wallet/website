import { CHAINS } from "./config.js";
import { connectChain } from "./chain.js";
import { createMarket } from "./market.js";
import { createFees } from "./fees.js";
import { createIndexer } from "./indexer.js";
import { createRelayer } from "./relayer.js";

/**
 * Everything the backend runs for one chain, built once:
 *
 *   provider / logsProvider / pool    connections (chain.js)
 *   market                            routes and prices (market.js)
 *   fees                              the relayer's fee (fees.js)
 *   indexer                           the pool's events -> MongoDB (indexer.js)
 *   relayer                           checks and submits proofs (relayer.js)
 */

const services = new Map();

export function serviceFor(chain) {
  let service = services.get(chain.id);
  if (!service) {
    const connection = connectChain(chain);
    const market = createMarket(connection);
    const fees = createFees(connection, market);
    const indexer = createIndexer(connection);
    const relayer = createRelayer(connection, { indexer, fees, market });
    service = { ...connection, market, fees, indexer, relayer };
    services.set(chain.id, service);
  }
  return service;
}

export const allServices = () => CHAINS.map(serviceFor);
