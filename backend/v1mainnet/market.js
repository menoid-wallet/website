import { ethers } from "ethers";

import { V1M, tokenInfo } from "./config.js";
import { provider } from "./chain.js";

/**
 * Swap routing and prices — Menoid picks the route, not the user.
 *
 * For tokenIn -> tokenOut it tries every fee tier directly and every two-hop
 * route through a connector token, quotes each with Uniswap's QuoterV2 and
 * keeps the best output (the protocol repo's helpers/uniswap.js findBestRoute).
 * The chosen path becomes the swap's routeData, which the user's proof binds.
 */

const FACTORY_ABI = ["function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)"];
const QUOTER_ABI = [
  "function quoteExactInput(bytes path, uint256 amountIn) returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
];

const factory = new ethers.Contract(V1M.uniswap.factory, FACTORY_ABI, provider);
const quoter = new ethers.Contract(V1M.uniswap.quoterV2, QUOTER_ABI, provider);

// pools never disappear: remember the ones that exist, re-check missing ones now and then
const poolCache = new Map(); // key -> { exists, at }
const POOL_MISS_TTL = 60_000;

async function poolExists(a, b, fee) {
  const [x, y] = [a.toLowerCase(), b.toLowerCase()].sort();
  const key = `${x}:${y}:${fee}`;
  const hit = poolCache.get(key);
  if (hit && (hit.exists || Date.now() - hit.at < POOL_MISS_TTL)) return hit.exists;
  const exists = (await factory.getPool(a, b, fee)) !== ethers.ZeroAddress;
  poolCache.set(key, { exists, at: Date.now() });
  return exists;
}

// tokenIn | fee | token | fee | ... | tokenOut
export function encodePath(tokens, fees) {
  let path = "0x";
  for (let i = 0; i < fees.length; i++) {
    path += ethers.getAddress(tokens[i]).slice(2) + fees[i].toString(16).padStart(6, "0");
  }
  return (path + ethers.getAddress(tokens[tokens.length - 1]).slice(2)).toLowerCase();
}

export async function findBestRoute({ tokenIn, tokenOut, amountIn }) {
  tokenIn = ethers.getAddress(tokenIn);
  tokenOut = ethers.getAddress(tokenOut);
  if (tokenIn === tokenOut) throw new Error("choose two different tokens");
  amountIn = BigInt(amountIn);
  if (amountIn <= 0n) throw new Error("amount must be positive");

  const tiers = V1M.uniswap.feeTiers;
  const candidates = [];
  for (const fee of tiers) {
    if (await poolExists(tokenIn, tokenOut, fee)) candidates.push({ tokens: [tokenIn, tokenOut], fees: [fee] });
  }
  for (const mid of V1M.uniswap.connectors.map((c) => ethers.getAddress(c))) {
    if (mid === tokenIn || mid === tokenOut) continue;
    for (const f1 of tiers) {
      if (!(await poolExists(tokenIn, mid, f1))) continue;
      for (const f2 of tiers) {
        if (await poolExists(mid, tokenOut, f2)) candidates.push({ tokens: [tokenIn, mid, tokenOut], fees: [f1, f2] });
      }
    }
  }

  let best = null;
  const tried = [];
  for (const candidate of candidates) {
    const path = encodePath(candidate.tokens, candidate.fees);
    try {
      const quote = await quoter.quoteExactInput.staticCall(path, amountIn);
      const amountOut = BigInt(quote.amountOut ?? quote[0]);
      tried.push({ fees: candidate.fees, hops: candidate.fees.length, amountOut: amountOut.toString() });
      if (!best || amountOut > best.amountOut) best = { ...candidate, path, amountOut };
    } catch {
      // no liquidity in range on this route
    }
  }
  if (!best) throw new Error("no route for this pair");
  return {
    tokenIn,
    tokenOut,
    amountIn: amountIn.toString(),
    amountOut: best.amountOut.toString(),
    path: best.path,
    tokens: best.tokens,
    fees: best.fees,
    adapter: V1M.swapAdapter,
    candidates: tried,
  };
}

/* ─── prices ───────────────────────────────────────────────────────────────
   Testnet tokens have no market price, so they are priced by the testnet's
   own pools against mUSDC (= $1): what 1 token sells for there. */

const PRICE_TTL = 30_000;
let priceCache = { at: 0, prices: null };

export async function tokenPrices() {
  if (priceCache.prices && Date.now() - priceCache.at < PRICE_TTL) return priceCache.prices;
  const stable = V1M.tokens.find((t) => t.stable);
  const prices = {};
  for (const token of V1M.tokens) {
    if (token.stable) {
      prices[token.address] = 1;
      continue;
    }
    try {
      const unit = 10n ** BigInt(token.decimals);
      const route = await findBestRoute({ tokenIn: token.address, tokenOut: stable.address, amountIn: unit / 100n });
      prices[token.address] = (Number(route.amountOut) / 10 ** stable.decimals) * 100;
    } catch {
      prices[token.address] = priceCache.prices?.[token.address] ?? 0;
    }
  }
  priceCache = { at: Date.now(), prices };
  return prices;
}

export function describeToken(address) {
  return tokenInfo(address);
}
