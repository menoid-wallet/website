import { ethers } from "ethers";

import { tokenInfo } from "./config.js";

/**
 * Swap routing and prices for one chain — Menoid picks the route, not the user.
 *
 * Venues (config.js `venues`): Uniswap V3 itself, and on Monad also Capricorn
 * — nad.fun's DEX, a Uniswap V3 fork where Monad's memecoins trade — reached
 * through Menoid's V3PoolAdapter, which is that venue's quoter too (the same
 * interface as Uniswap's QuoterV2). For tokenIn -> tokenOut every venue tries
 * every fee tier directly and every two-hop route through one of its
 * connector tokens; each candidate is quoted and the best output wins. Its
 * venue's adapter and path become the swap's adapter and routeData, which the
 * user's proof binds.
 *
 * A search costs two eth_calls however many pools it looks at: every pool
 * lookup in one Multicall3 call, every quote in another (a few per batch, for
 * the RPC's gas cap). The price refresher quotes every token's remembered
 * route the same way, so dozens of tokens stay cheap on a free RPC.
 *
 * Prices: the native coin at its REAL price — the mid price of its mainnet's
 * deepest native/USDC Uniswap V3 pool (slot0: no trade, no fee, no slippage),
 * even on testnet. Stablecoins are $1; a token with `pegTo` takes that token's
 * price (BTC wrappers, LSTs without pools); every other token is priced by a
 * $1 probe: how much of it $1 of the native coin buys on the best route (or
 * $1 of the stable token, if the native price is unknown).
 *
 * Tokens beyond the configured list (a user pasted an address): describeToken
 * reads them from the chain — symbol, decimals, whether the pool accepts them,
 * and a price if a venue has one. The relayer accepts any token it can price.
 */

const FACTORY_ABI = ["function getPool(address tokenA, address tokenB, uint24 fee) view returns (address)"];
const QUOTER_ABI = [
  "function quoteExactInput(bytes path, uint256 amountIn) returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
];
const POOL_STATE_ABI = [
  "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16, uint16, uint16, uint8, bool)",
  "function liquidity() view returns (uint128)",
  "function token0() view returns (address)",
];
const ERC20_META = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
];

// Multicall3: the same address on Monad, Base and most EVM chains
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
const MULTICALL_ABI = [
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)",
];

const factoryInterface = new ethers.Interface(FACTORY_ABI);
const quoterInterface = new ethers.Interface(QUOTER_ABI);

const POOL_MISS_TTL = 10 * 60_000; // a pool that did not exist is looked up again after this
const PRICE_TTL = 30_000;
const ROUTE_TTL = 10 * 60_000; // re-search a token's best probe route this often; quote it in between
const TOKEN_TTL = 5 * 60_000;
const LOOKUPS_PER_CALL = 120;
const QUOTES_PER_CALL = 6; // each quote runs a swap: keep a batch well under the RPC's eth_call gas cap

// tokenIn | fee | token | fee | ... | tokenOut
export function encodePath(tokens, fees) {
  let path = "0x";
  for (let i = 0; i < fees.length; i++) {
    path += ethers.getAddress(tokens[i]).slice(2) + fees[i].toString(16).padStart(6, "0");
  }
  return (path + ethers.getAddress(tokens[tokens.length - 1]).slice(2)).toLowerCase();
}

// a chain without its own `venues` routes through its one Uniswap V3 deployment
export function venuesOf(chain) {
  const list = chain.venues || [
    {
      id: "uniswap-v3",
      name: "Uniswap V3",
      factory: chain.uniswap.factory,
      quoter: chain.uniswap.quoterV2,
      adapter: chain.swapAdapter,
      connectors: chain.uniswap.connectors,
      feeTiers: chain.uniswap.feeTiers,
    },
  ];
  // a venue whose adapter is not deployed (yet) is left out
  return list
    .filter((v) => v.factory && v.quoter && v.adapter)
    .map((v) => ({
      ...v,
      factory: ethers.getAddress(v.factory),
      quoter: ethers.getAddress(v.quoter),
      adapter: ethers.getAddress(v.adapter),
      connectors: v.connectors.map((c) => ethers.getAddress(c)),
    }));
}

export function createMarket({ chain, provider, pool }) {
  const venues = venuesOf(chain);
  const venueById = new Map(venues.map((v) => [v.id, v]));
  const multicall = new ethers.Contract(MULTICALL3, MULTICALL_ABI, provider);
  let noMulticall = false;

  /* [{ target, data }] -> [{ ok, data }]: one eth_call per `size` calls
     (Multicall3, a failing call does not fail the rest); one each without it.
     One call can still sink a whole batch: a quote through an almost empty
     pool walks every tick to the price limit and burns the call's entire gas.
     Then that batch is asked again one call at a time, so only it fails. */
  async function callMany(calls, size) {
    const out = [];
    for (let i = 0; i < calls.length; i += size) {
      const part = calls.slice(i, i + size);
      if (!noMulticall) {
        try {
          const results = await multicall.aggregate3.staticCall(part.map((c) => ({ target: c.target, allowFailure: true, callData: c.data })));
          out.push(...results.map((r) => ({ ok: r.success && r.returnData !== "0x", data: r.returnData })));
          continue;
        } catch {
          if ((await provider.getCode(MULTICALL3).catch(() => "")) === "0x") noMulticall = true;
        }
      }
      for (const c of part) {
        out.push(await provider.call({ to: c.target, data: c.data }).then((data) => ({ ok: data !== "0x", data }), () => ({ ok: false, data: "0x" })));
      }
    }
    return out;
  }

  // pools never disappear: remember the ones that exist, look missing ones up again now and then
  const poolCache = new Map(); // factory:a:b:fee -> { exists, at }
  const pairKey = (venue, a, b, fee) => {
    const [x, y] = [a.toLowerCase(), b.toLowerCase()].sort();
    return `${venue.factory}:${x}:${y}:${fee}`;
  };
  async function lookUpPools(venue, pairs) {
    const fresh = (hit) => hit && (hit.exists || Date.now() - hit.at < POOL_MISS_TTL);
    const todo = [...new Map(pairs.map((p) => [pairKey(venue, p.a, p.b, p.fee), p])).entries()].filter(([key]) => !fresh(poolCache.get(key)));
    if (todo.length) {
      const results = await callMany(
        todo.map(([, p]) => ({ target: venue.factory, data: factoryInterface.encodeFunctionData("getPool", [p.a, p.b, p.fee]) })),
        LOOKUPS_PER_CALL
      );
      todo.forEach(([key], i) => {
        const address = results[i].ok ? factoryInterface.decodeFunctionResult("getPool", results[i].data)[0] : ethers.ZeroAddress;
        poolCache.set(key, { exists: address !== ethers.ZeroAddress, at: Date.now() });
      });
    }
    return (a, b, fee) => Boolean(poolCache.get(pairKey(venue, a, b, fee))?.exists);
  }

  // [{ quoter, path, amountIn }] -> amountOut (bigint) or null, batched
  async function quoteMany(items) {
    const results = await callMany(
      items.map((q) => ({ target: q.quoter, data: quoterInterface.encodeFunctionData("quoteExactInput", [q.path, q.amountIn]) })),
      QUOTES_PER_CALL
    );
    return results.map((r) => {
      if (!r.ok) return null;
      const amountOut = BigInt(quoterInterface.decodeFunctionResult("quoteExactInput", r.data)[0]);
      return amountOut > 0n ? amountOut : null;
    });
  }

  async function findBestRoute({ tokenIn, tokenOut, amountIn }) {
    tokenIn = ethers.getAddress(tokenIn);
    tokenOut = ethers.getAddress(tokenOut);
    if (tokenIn === tokenOut) throw new Error("choose two different tokens");
    amountIn = BigInt(amountIn);
    if (amountIn <= 0n) throw new Error("amount must be positive");

    const candidates = [];
    for (const venue of venues) {
      const tiers = venue.feeTiers;
      const mids = venue.connectors.filter((m) => m !== tokenIn && m !== tokenOut);
      const pairs = tiers.flatMap((fee) => [{ a: tokenIn, b: tokenOut, fee }, ...mids.flatMap((mid) => [{ a: tokenIn, b: mid, fee }, { a: mid, b: tokenOut, fee }])]);
      const has = await lookUpPools(venue, pairs);
      for (const fee of tiers) {
        if (has(tokenIn, tokenOut, fee)) candidates.push({ venue, tokens: [tokenIn, tokenOut], fees: [fee] });
      }
      for (const mid of mids) {
        for (const f1 of tiers) {
          if (!has(tokenIn, mid, f1)) continue;
          for (const f2 of tiers) {
            if (has(mid, tokenOut, f2)) candidates.push({ venue, tokens: [tokenIn, mid, tokenOut], fees: [f1, f2] });
          }
        }
      }
    }

    const paths = candidates.map((c) => encodePath(c.tokens, c.fees));
    const outs = await quoteMany(candidates.map((c, i) => ({ quoter: c.venue.quoter, path: paths[i], amountIn })));
    let best = null;
    const tried = [];
    candidates.forEach((c, i) => {
      if (outs[i] === null) return; // no liquidity in range on this route
      tried.push({ venue: c.venue.id, fees: c.fees, hops: c.fees.length, amountOut: outs[i].toString() });
      if (!best || outs[i] > best.amountOut) best = { ...c, path: paths[i], amountOut: outs[i] };
    });
    if (!best) throw new Error("no route for this pair");
    return {
      chainId: chain.chainId,
      tokenIn,
      tokenOut,
      amountIn: amountIn.toString(),
      amountOut: best.amountOut.toString(),
      path: best.path,
      tokens: best.tokens,
      fees: best.fees,
      adapter: best.venue.adapter,
      venue: best.venue.id,
      venueName: best.venue.name,
      candidates: tried,
    };
  }

  /* ─── prices ─────────────────────────────────────────────────────────── */

  const src = chain.priceSource;
  const mainnetNetwork = ethers.Network.from(src.chainId);
  const mainnet = new ethers.JsonRpcProvider(src.rpcUrl, mainnetNetwork, { staticNetwork: mainnetNetwork, batchMaxCount: 1 });
  const mainnetFactory = new ethers.Contract(src.factory, FACTORY_ABI, mainnet);
  let lastNativeUsd = null;
  let priceCache = { at: 0, prices: null };
  let pricing = null; // the refresh in flight, shared

  async function nativeUsdPrice() {
    try {
      let best = null;
      for (const fee of src.feeTiers) {
        const address = await mainnetFactory.getPool(src.wrappedNative, src.usdc, fee);
        if (address === ethers.ZeroAddress) continue;
        const pool = new ethers.Contract(address, POOL_STATE_ABI, mainnet);
        const [slot0, liquidity, token0] = await Promise.all([pool.slot0(), pool.liquidity(), pool.token0()]);
        if (!best || liquidity > best.liquidity) best = { slot0, liquidity, token0 };
      }
      if (!best) throw new Error(`no ${chain.nativeSymbol}/USDC pool on mainnet`);
      // raw token1 per raw token0, then to human units (native 18 decimals, USDC 6)
      const sqrt = BigInt(best.slot0.sqrtPriceX96);
      const raw = Number((sqrt * sqrt * 10n ** 18n) / (1n << 192n)) / 1e18;
      const nativeIsToken0 = best.token0.toLowerCase() === src.wrappedNative.toLowerCase();
      const usd = nativeIsToken0 ? raw * 1e12 : 1 / (raw / 1e12);
      if (!(usd > 0) || !Number.isFinite(usd)) throw new Error(`bad ${chain.nativeSymbol} price`);
      lastNativeUsd = usd;
      return usd;
    } catch (error) {
      if (lastNativeUsd !== null) return lastNativeUsd; // keep the last good price
      throw error;
    }
  }

  const nativeToken = chain.tokens.find((t) => t.native);
  const stableToken = chain.tokens.find((t) => t.stable);

  // $1 of the native coin (or of the stable token, without a native price)
  async function probeAmount() {
    try {
      const usd = await nativeUsdPrice();
      return { from: nativeToken.address, amountIn: BigInt(Math.round(1e18 / usd)) };
    } catch (error) {
      if (!stableToken) throw error;
      return { from: stableToken.address, amountIn: 10n ** BigInt(stableToken.decimals) };
    }
  }

  const priceFrom = (out, token) => {
    const tokens = Number(out) / 10 ** token.decimals;
    return tokens > 0 ? 1 / tokens : 0;
  };

  /* USD prices of `tokens` by $1 probes. Remembered routes are quoted in
     batches; a token whose route is new, old or broken is searched again. */
  const probeRoutes = new Map(); // lower address -> { at, from, path, quoter } (path null: no route)
  async function probePrices(tokens) {
    const { from, amountIn } = await probeAmount();
    const prices = {};
    const known = [];
    const search = [];
    for (const token of tokens) {
      const route = probeRoutes.get(token.address.toLowerCase());
      if (route && route.from === from && Date.now() - route.at < ROUTE_TTL) {
        if (route.path) known.push([token, route]); // no route yet: wait for the next search
      } else search.push(token);
    }
    const outs = await quoteMany(known.map(([, r]) => ({ quoter: r.quoter, path: r.path, amountIn })));
    known.forEach(([token], i) => {
      if (outs[i]) prices[token.address] = priceFrom(outs[i], token);
      else search.push(token); // the route stopped quoting
    });
    for (const token of search) {
      try {
        const route = await findBestRoute({ tokenIn: from, tokenOut: token.address, amountIn });
        probeRoutes.set(token.address.toLowerCase(), { at: Date.now(), from, path: route.path, quoter: venueById.get(route.venue).quoter });
        prices[token.address] = priceFrom(BigInt(route.amountOut), token);
      } catch {
        probeRoutes.set(token.address.toLowerCase(), { at: Date.now(), from, path: null });
      }
    }
    return prices;
  }

  async function refreshPrices() {
    const prices = {};
    const keep = (token) => priceCache.prices?.[token.address] ?? 0;
    // stables and the native coin first, then by route, then the pegged ones
    for (const token of chain.tokens.filter((t) => t.stable || t.native)) {
      try {
        prices[token.address] = token.stable ? 1 : await nativeUsdPrice();
      } catch {
        prices[token.address] = keep(token);
      }
    }
    const probed = chain.tokens.filter((t) => !t.stable && !t.native && !t.pegTo);
    const found = await probePrices(probed).catch(() => ({}));
    for (const token of probed) prices[token.address] = found[token.address] || keep(token);
    for (const token of chain.tokens.filter((t) => t.pegTo)) {
      const peg = chain.tokens.find((t) => t.address.toLowerCase() === token.pegTo.toLowerCase());
      prices[token.address] = (peg && prices[peg.address]) || keep(token);
    }
    priceCache = { at: Date.now(), prices };
    return prices;
  }

  async function tokenPrices() {
    if (priceCache.prices && Date.now() - priceCache.at < PRICE_TTL) return priceCache.prices;
    pricing ||= refreshPrices().finally(() => {
      pricing = null;
    });
    return pricing;
  }

  /* ─── any token: the configured list, or one read from the chain ──── */

  const tokenCache = new Map(); // lower address -> { at, value }

  /** A token's metadata: configured, or read from its contract. Throws if it is not an ERC-20. */
  async function tokenMeta(address) {
    const listed = tokenInfo(chain, address);
    if (listed) return { ...listed, listed: true };
    const key = String(address).toLowerCase();
    const hit = tokenCache.get(key);
    if (hit && Date.now() - hit.at < TOKEN_TTL) return hit.value;
    const checksummed = ethers.getAddress(address);
    const erc = new ethers.Contract(checksummed, ERC20_META, provider);
    const [symbol, decimals] = await Promise.all([erc.symbol(), erc.decimals()]);
    const name = await erc.name().catch(() => symbol);
    const value = { symbol: String(symbol).slice(0, 16), name: String(name).slice(0, 48), address: checksummed, decimals: Number(decimals), listed: false };
    tokenCache.set(key, { at: Date.now(), value });
    return value;
  }

  /** USD per token (0 if nothing prices it). */
  async function priceOf(address) {
    const listed = tokenInfo(chain, address);
    if (listed) return (await tokenPrices())[listed.address] || 0;
    const key = `price:${String(address).toLowerCase()}`;
    const hit = tokenCache.get(key);
    if (hit && Date.now() - hit.at < PRICE_TTL) return hit.value;
    let value = 0;
    try {
      const meta = await tokenMeta(address);
      value = (await probePrices([meta]))[meta.address] || 0;
    } catch {
      value = 0;
    }
    tokenCache.set(key, { at: Date.now(), value });
    return value;
  }

  /** What the app needs to offer a pasted token: who it is, whether the pool takes it, its price. */
  async function describeToken(address) {
    const meta = await tokenMeta(address);
    const [config, priceUsd] = await Promise.all([pool.tokenConfig(meta.address), priceOf(meta.address)]);
    return {
      ...meta,
      enabled: Boolean(config.depositsEnabled ?? config[0]),
      maxDeposit: (config.maxDeposit ?? config[1]).toString(),
      priceUsd,
      // the relayer needs a price to take its fee in this token
      relayable: priceUsd > 0,
    };
  }

  const priceNote = `${chain.nativeSymbol}: ${src.chainId === 143 ? "Monad" : "Base"} mainnet ${nativeToken?.wrapped}/USDC pool · stablecoins: $1 · pegged tokens: their peg · others: a $1 probe from ${chain.nativeSymbol} on ${venues.map((v) => v.name).join(" / ")}`;

  // keep the cache warm, so /prices answers at once
  function startPriceRefresher() {
    const refresh = () => tokenPrices().catch((e) => console.error(`[v1m ${chain.id}] prices:`, e.message));
    refresh();
    setInterval(refresh, PRICE_TTL - 5_000).unref?.();
  }

  return {
    venues,
    findBestRoute,
    nativeUsdPrice,
    tokenPrices,
    tokenMeta,
    priceOf,
    describeToken,
    priceNote,
    startPriceRefresher,
  };
}
