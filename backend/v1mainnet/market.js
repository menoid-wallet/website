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
   MON at its REAL price: the mid price of Monad mainnet's deepest MON/USDC
   Uniswap V3 pool (read from slot0 — no trade, no fee, no slippage). mUSDC is
   $1. Other test tokens have no market, so the testnet's own pools price them
   against mUSDC. */

const PRICE_TTL = 30_000;
let priceCache = { at: 0, prices: null };
let lastMonUsd = null;

const src = V1M.priceSource;
const mainnetNetwork = ethers.Network.from(src.chainId);
const mainnet = new ethers.JsonRpcProvider(src.rpcUrl, mainnetNetwork, { staticNetwork: mainnetNetwork, batchMaxCount: 1 });
const mainnetFactory = new ethers.Contract(src.factory, FACTORY_ABI, mainnet);
const POOL_STATE_ABI = [
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
  "function liquidity() view returns (uint128)",
  "function token0() view returns (address)",
];

export async function monUsdPrice() {
  try {
    let best = null;
    for (const fee of src.feeTiers) {
      const address = await mainnetFactory.getPool(src.wmon, src.usdc, fee);
      if (address === ethers.ZeroAddress) continue;
      const pool = new ethers.Contract(address, POOL_STATE_ABI, mainnet);
      const [slot0, liquidity, token0] = await Promise.all([pool.slot0(), pool.liquidity(), pool.token0()]);
      if (!best || liquidity > best.liquidity) best = { slot0, liquidity, token0 };
    }
    if (!best) throw new Error("no MON/USDC pool on mainnet");
    // raw token1 per raw token0, then to human units (WMON 18 decimals, USDC 6)
    const sqrt = BigInt(best.slot0.sqrtPriceX96);
    const raw = Number((sqrt * sqrt * 10n ** 18n) / (1n << 192n)) / 1e18;
    const monIsToken0 = best.token0.toLowerCase() === src.wmon.toLowerCase();
    const usd = monIsToken0 ? raw * 1e12 : 1 / (raw / 1e12);
    if (!(usd > 0) || !Number.isFinite(usd)) throw new Error("bad MON price");
    lastMonUsd = usd;
    return usd;
  } catch (error) {
    if (lastMonUsd !== null) return lastMonUsd; // keep the last good price
    throw error;
  }
}

export async function tokenPrices() {
  if (priceCache.prices && Date.now() - priceCache.at < PRICE_TTL) return priceCache.prices;
  const stable = V1M.tokens.find((t) => t.stable);
  const prices = {};
  for (const token of V1M.tokens) {
    try {
      if (token.stable) prices[token.address] = 1;
      else if (token.native) prices[token.address] = await monUsdPrice();
      else {
        const unit = 10n ** BigInt(token.decimals);
        const route = await findBestRoute({ tokenIn: token.address, tokenOut: stable.address, amountIn: unit / 100n });
        prices[token.address] = (Number(route.amountOut) / 10 ** stable.decimals) * 100;
      }
    } catch {
      prices[token.address] = priceCache.prices?.[token.address] ?? 0;
    }
  }
  priceCache = { at: Date.now(), prices };
  return prices;
}

// keep the cache warm, so /prices answers at once
export function startPriceRefresher() {
  const refresh = () => tokenPrices().catch((e) => console.error("[v1m] prices:", e.message));
  refresh();
  setInterval(refresh, PRICE_TTL - 5_000).unref?.();
}

export function describeToken(address) {
  return tokenInfo(address);
}
