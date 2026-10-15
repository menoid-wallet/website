import { ethers } from "ethers";

import { V1mRelay } from "./models.js";

/**
 * The relayer's fee on one chain: what a private transaction really costs it,
 * plus a little profit. Never a constant.
 *
 *   gas(kind, proofs)  = fixed + perCall × proofs           per action type
 *                        (transfer, withdraw, swap 1 hop, swap 2 hops),
 *                        learned from the relayer's own confirmed relays on
 *                        this chain: the 75th percentile of the last 30
 *   cost (native)      = gas × gas price                    × 1.10 on Monad,
 *                                                           which bills the LIMIT
 *                      + L1 data fee                        rollups (Base): the
 *                                                           GasPriceOracle's bound
 *                      + proofs × sweep                     cashing out each fee
 *                        note later costs a quarter of a    note is a private
 *                        withdraw proof (4 inputs)          note too
 *   quote              = cost × (1 + profit 5% + slack 10%), split per proof,
 *                        converted to the token being spent at real prices,
 *                        rounded up
 *
 * The relay check is break-even on the ACTUAL transaction (its own gas
 * estimate and calldata, today's prices): the slack absorbs normal drift, so a
 * user is only asked to re-prove when costs have really moved past it.
 */

const MODEL_TTL = 60_000;
const GAS_PRICE_TTL = 10_000;
const L1_FEE_TTL = 30_000;
const SAMPLE = 30;

// OP Stack predeploy: the L1 data fee a transaction of this size can cost at most
const GAS_PRICE_ORACLE = "0x420000000000000000000000000000000000000F";
const ORACLE_ABI = ["function getL1FeeUpperBound(uint256 unsignedTxSize) view returns (uint256)"];

const modelKey = (kind, hops = 1) => (kind === "swap" ? (hops > 1 ? "swap2" : "swap1") : kind);
const ceilDiv = (a, b) => (a + b - 1n) / b;

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[i];
}

export function createFees({ chain, provider }, market) {
  const nativeToken = chain.tokens.find((t) => t.native);
  const oracle = chain.gas.l1DataFee === "op-stack" ? new ethers.Contract(GAS_PRICE_ORACLE, ORACLE_ABI, provider) : null;
  let model = { at: 0, gas: null };
  let gasPriceCache = { at: 0, wei: null };
  const l1Cache = new Map(); // size bucket -> { at, wei }

  /** fixed + perCall gas per action type, from the relayer's own history here. */
  async function gasModel() {
    if (model.gas && Date.now() - model.at < MODEL_TTL) return model.gas;
    const gas = Object.fromEntries(Object.entries(chain.fees.defaults).map(([k, v]) => [k, { ...v, samples: 0, source: "measured" }]));
    const recent = await V1mRelay.find({ chainId: chain.chainId, status: "confirmed", gasEstimate: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    const byKey = {};
    for (const r of recent) (byKey[modelKey(r.kind, r.hops ?? 1)] ||= []).push(r);
    for (const [key, list] of Object.entries(byKey)) {
      if (!gas[key]) continue;
      const perCall = list.slice(0, SAMPLE).map((r) => (Number(r.gasEstimate) - gas[key].fixed) / (r.calls || 1));
      if (perCall.length >= 3) {
        gas[key] = { ...gas[key], perCall: Math.round(percentile(perCall, 0.75)), samples: perCall.length, source: "live relays" };
      }
    }
    model = { at: Date.now(), gas };
    return gas;
  }

  /** What one unit of gas costs right now (base fee + tip), in wei of the native coin. */
  async function gasPriceWei() {
    if (gasPriceCache.wei && Date.now() - gasPriceCache.at < GAS_PRICE_TTL) return gasPriceCache.wei;
    const data = await provider.getFeeData();
    const wei = data.gasPrice ?? data.maxFeePerGas;
    if (!wei) throw new Error("no gas price from the RPC");
    gasPriceCache = { at: Date.now(), wei };
    return wei;
  }

  /** The L1 data fee for a transaction of `bytes` (0 off rollups). */
  async function l1FeeWei(bytes) {
    if (!oracle) return 0n;
    const bucket = Math.ceil(bytes / 256) * 256; // a few sizes, cached
    const hit = l1Cache.get(bucket);
    if (hit && Date.now() - hit.at < L1_FEE_TTL) return hit.wei;
    const wei = BigInt(await oracle.getL1FeeUpperBound(bucket));
    l1Cache.set(bucket, { at: Date.now(), wei });
    return wei;
  }

  const txBytes = (kind, calls) => chain.callBytes.base + chain.callBytes[kind] * calls;

  // native (wei) -> token base units, at real prices; rounded up
  function nativeToToken(wei, token, prices) {
    if (token.native) return wei; // the wrapped native IS the native coin
    const nativeUsd = prices[nativeToken.address];
    const tokenUsd = prices[token.address];
    if (!(nativeUsd > 0) || !(tokenUsd > 0)) throw new Error(`no price for ${token.symbol} yet`);
    const tokensPerNative = BigInt(Math.ceil((nativeUsd / tokenUsd) * 1e12)); // × 1e12
    return ceilDiv(wei * tokensPerNative * 10n ** BigInt(token.decimals), 10n ** 30n);
  }

  // token base units -> native (wei), at real prices; rounded down
  function tokenToNative(amount, token, prices) {
    if (token.native) return amount;
    const nativeUsd = prices[nativeToken.address];
    const tokenUsd = prices[token.address];
    if (!(nativeUsd > 0) || !(tokenUsd > 0)) return 0n;
    const nativePerToken = BigInt(Math.floor((tokenUsd / nativeUsd) * 1e12)); // × 1e12
    return (amount * nativePerToken * 10n ** 18n) / (10n ** BigInt(token.decimals) * 10n ** 12n);
  }

  /** The relayer's real cost for a transaction of `gas` and `bytes` carrying `proofs` fee notes. */
  async function costWei(gas, proofs, bytes) {
    const [models, price, l1] = await Promise.all([gasModel(), gasPriceWei(), l1FeeWei(bytes)]);
    const billed = (g) => (chain.gas.chargedOnLimit ? (BigInt(Math.ceil(g)) * BigInt(chain.gas.limitPct) * price) / 100n : BigInt(Math.ceil(g)) * price);
    const exec = billed(gas) + l1;
    const w = models.withdraw;
    const sweepTx = billed(w.fixed + w.perCall) + (await l1FeeWei(txBytes("withdraw", 1)));
    const sweepPerNote = sweepTx / BigInt(chain.fees.notesPerSweep);
    return { exec, l1, sweep: sweepPerNote * BigInt(proofs), total: exec + sweepPerNote * BigInt(proofs), price };
  }

  // the configured prices, plus the price of a token beyond the list
  async function pricesWith(token) {
    const prices = await market.tokenPrices();
    if (prices[token.address] > 0) return prices;
    return { ...prices, [token.address]: await market.priceOf(token.address) };
  }

  /** A fee quote for `calls` proofs of `kind`, paid in `token` (any token the relayer can price). */
  async function feeQuote({ kind, token, calls = 1, hops = 1 }) {
    if (!["transfer", "withdraw", "swap"].includes(kind)) throw new Error("unknown action");
    let t;
    try {
      t = await market.tokenMeta(token);
    } catch {
      throw new Error("not a token");
    }
    calls = Math.min(Math.max(Number(calls) || 1, 1), 8);
    hops = Math.min(Math.max(Number(hops) || 1, 1), 3);

    const [models, prices] = await Promise.all([gasModel(), pricesWith(t)]);
    const m = models[modelKey(kind, hops)];
    const gas = m.fixed + m.perCall * calls;
    const cost = await costWei(gas, calls, txBytes(kind, calls));
    const markup = BigInt(100 + chain.fees.profitPct + chain.fees.slackPct);
    const totalWei = (cost.total * markup) / 100n;
    const perCallWei = ceilDiv(totalWei, BigInt(calls));
    const feePerCall = nativeToToken(perCallWei, t, prices);

    return {
      chainId: chain.chainId,
      kind,
      token: t.address,
      symbol: t.symbol,
      decimals: t.decimals,
      calls,
      hops,
      feePerCall: feePerCall.toString(),
      feeTotal: (feePerCall * BigInt(calls)).toString(),
      feeUsd: Number(ethers.formatEther(perCallWei * BigInt(calls))) * (prices[nativeToken.address] || 0),
      nativeSymbol: chain.nativeSymbol,
      costNative: ethers.formatEther(cost.total),
      feeNative: ethers.formatEther(perCallWei * BigInt(calls)),
      nativeUsd: prices[nativeToken.address],
      gasPriceGwei: Number(ethers.formatUnits(cost.price, "gwei")),
      breakdown: {
        gas,
        gasPerCall: m.perCall,
        fixedGas: m.fixed,
        gasModel: m.source,
        gasLimitPct: chain.gas.limitPct,
        chargedOnLimit: chain.gas.chargedOnLimit,
        executionNative: ethers.formatEther(cost.exec - cost.l1),
        l1DataFeeNative: ethers.formatEther(cost.l1),
        sweepNative: ethers.formatEther(cost.sweep),
        profitPct: chain.fees.profitPct,
        slackPct: chain.fees.slackPct,
      },
      validForSeconds: chain.fees.quoteTtlSec,
    };
  }

  /** Do these fee notes cover what this exact transaction will cost? */
  async function coversCost({ gasEstimate, calls, fees, dataBytes }) {
    const prices = await pricesWith(fees[0].token);
    const cost = await costWei(Number(gasEstimate), calls, dataBytes + chain.callBytes.base);
    const paid = fees.reduce((sum, f) => sum + tokenToNative(f.amount, f.token, prices), 0n);
    return { ok: paid >= cost.total, costWei: cost.total, paidWei: paid, gasPriceWei: cost.price };
  }

  /** The whole table, for the app's fee display and for monitoring. */
  async function feeTable() {
    const prices = await market.tokenPrices();
    const rows = {};
    for (const kind of ["transfer", "withdraw", "swap"]) {
      rows[kind] = {};
      for (const t of chain.tokens) {
        const q = await feeQuote({ kind, token: t.address, calls: 1, hops: 1 });
        rows[kind][t.symbol] = { feePerCall: q.feePerCall, decimals: t.decimals, feeNative: q.feeNative, feeUsd: q.feeUsd };
      }
    }
    return {
      chainId: chain.chainId,
      nativeSymbol: chain.nativeSymbol,
      prices,
      gas: await gasModel(),
      gasPriceGwei: Number(ethers.formatUnits(await gasPriceWei(), "gwei")),
      l1DataFee: chain.gas.l1DataFee,
      rows,
      policy: { profitPct: chain.fees.profitPct, slackPct: chain.fees.slackPct, notesPerSweep: chain.fees.notesPerSweep },
    };
  }

  return { gasModel, gasPriceWei, l1FeeWei, feeQuote, coversCost, feeTable };
}
