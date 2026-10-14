import { ethers } from "ethers";

import { V1M, tokenInfo } from "./config.js";
import { provider } from "./chain.js";
import { tokenPrices } from "./market.js";
import { V1mRelay } from "./models.js";

/**
 * The relayer's fee: what a private transaction really costs it, plus a
 * little profit. Never a constant.
 *
 *   gas(kind, proofs)  = fixed + perCall × proofs           per action type
 *                        (transfer, withdraw, swap 1 hop, swap 2 hops),
 *                        learned from the relayer's own confirmed relays:
 *                        the 75th percentile of the last 30, so it leans safe
 *   cost (MON)         = gas × 1.10 × gas price             Monad charges the
 *                                                           LIMIT (estimate + 10%)
 *                      + proofs × sweep                     cashing out each fee
 *                        note later costs a quarter of a    note is a private
 *                        withdraw proof (4 inputs)          note too
 *   quote              = cost × (1 + profit 5% + slack 10%), split per proof,
 *                        converted to the token being spent at real prices,
 *                        rounded up
 *
 * The relay check is break-even on the ACTUAL transaction (its own gas
 * estimate, today's gas price): the slack absorbs normal drift, so a user is
 * only asked to re-prove when costs have really moved past it.
 */

const MODEL_TTL = 60_000;
const GAS_PRICE_TTL = 10_000;
const SAMPLE = 30;

let model = { at: 0, gas: null };
let gasPriceCache = { at: 0, wei: null };

const nativeToken = V1M.tokens.find((t) => t.native);
const modelKey = (kind, hops = 1) => (kind === "swap" ? (hops > 1 ? "swap2" : "swap1") : kind);
const ceilDiv = (a, b) => (a + b - 1n) / b;

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[i];
}

/** fixed + perCall gas per action type, from the relayer's own history. */
export async function gasModel() {
  if (model.gas && Date.now() - model.at < MODEL_TTL) return model.gas;
  const gas = Object.fromEntries(Object.entries(V1M.fees.defaults).map(([k, v]) => [k, { ...v, samples: 0, source: "measured on testnet" }]));
  const recent = await V1mRelay.find({ chainId: V1M.chainId, status: "confirmed", gasEstimate: { $exists: true } })
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

/** What one unit of gas costs right now (base fee + tip), in wei of MON. */
export async function gasPriceWei() {
  if (gasPriceCache.wei && Date.now() - gasPriceCache.at < GAS_PRICE_TTL) return gasPriceCache.wei;
  const data = await provider.getFeeData();
  const wei = data.gasPrice ?? ethers.parseUnits("102", "gwei");
  gasPriceCache = { at: Date.now(), wei };
  return wei;
}

// MON (wei) -> token base units, at real prices; rounded up
function monToToken(wei, token, prices) {
  if (token.native) return wei; // WMON is MON
  const monUsd = prices[nativeToken.address];
  const tokenUsd = prices[token.address];
  if (!(monUsd > 0) || !(tokenUsd > 0)) throw new Error(`no price for ${token.symbol} yet`);
  const tokensPerMon = BigInt(Math.ceil((monUsd / tokenUsd) * 1e12)); // × 1e12
  return ceilDiv(wei * tokensPerMon * 10n ** BigInt(token.decimals), 10n ** 30n);
}

// token base units -> MON (wei), at real prices; rounded down
function tokenToMon(amount, token, prices) {
  if (token.native) return amount;
  const monUsd = prices[nativeToken.address];
  const tokenUsd = prices[token.address];
  if (!(monUsd > 0) || !(tokenUsd > 0)) return 0n;
  const monPerToken = BigInt(Math.floor((tokenUsd / monUsd) * 1e12)); // × 1e12
  return (amount * monPerToken * 10n ** 18n) / (10n ** BigInt(token.decimals) * 10n ** 12n);
}

/** The relayer's real cost for a transaction of `gas` carrying `proofs` fee notes. */
async function costWei(gas, proofs) {
  const [models, price] = await Promise.all([gasModel(), gasPriceWei()]);
  const buffer = BigInt(V1M.gasBufferPct);
  const exec = (BigInt(Math.ceil(gas)) * buffer * price) / 100n;
  const w = models.withdraw;
  const sweepPerNote = (BigInt(w.fixed + w.perCall) * buffer * price) / 100n / BigInt(V1M.fees.notesPerSweep);
  return { exec, sweep: sweepPerNote * BigInt(proofs), total: exec + sweepPerNote * BigInt(proofs), price };
}

/** A fee quote for `calls` proofs of `kind`, paid in `token`. */
export async function feeQuote({ kind, token, calls = 1, hops = 1 }) {
  const t = tokenInfo(token);
  if (!t) throw new Error("unsupported token");
  if (!["transfer", "withdraw", "swap"].includes(kind)) throw new Error("unknown action");
  calls = Math.min(Math.max(Number(calls) || 1, 1), 8);
  hops = Math.min(Math.max(Number(hops) || 1, 1), 3);

  const [models, prices] = await Promise.all([gasModel(), tokenPrices()]);
  const m = models[modelKey(kind, hops)];
  const gas = m.fixed + m.perCall * calls;
  const cost = await costWei(gas, calls);
  const markup = BigInt(100 + V1M.fees.profitPct + V1M.fees.slackPct);
  const totalWei = (cost.total * markup) / 100n;
  const perCallWei = ceilDiv(totalWei, BigInt(calls));
  const feePerCall = monToToken(perCallWei, t, prices);

  return {
    kind,
    token: t.address,
    symbol: t.symbol,
    decimals: t.decimals,
    calls,
    hops,
    feePerCall: feePerCall.toString(),
    feeTotal: (feePerCall * BigInt(calls)).toString(),
    feeUsd: Number(ethers.formatEther(perCallWei * BigInt(calls))) * (prices[nativeToken.address] || 0),
    costMON: ethers.formatEther(cost.total),
    feeMON: ethers.formatEther(perCallWei * BigInt(calls)),
    monUsd: prices[nativeToken.address],
    gasPriceGwei: Number(ethers.formatUnits(cost.price, "gwei")),
    breakdown: {
      gas,
      gasPerCall: m.perCall,
      fixedGas: m.fixed,
      gasModel: m.source,
      gasBufferPct: V1M.gasBufferPct,
      executionMON: ethers.formatEther(cost.exec),
      sweepMON: ethers.formatEther(cost.sweep),
      profitPct: V1M.fees.profitPct,
      slackPct: V1M.fees.slackPct,
    },
    validForSeconds: V1M.fees.quoteTtlSec,
  };
}

/** Do these fee notes cover what this exact transaction will cost? */
export async function coversCost({ gasEstimate, calls, fees }) {
  const prices = await tokenPrices();
  const cost = await costWei(Number(gasEstimate), calls);
  const paid = fees.reduce((sum, f) => sum + tokenToMon(f.amount, f.token, prices), 0n);
  return { ok: paid >= cost.total, costWei: cost.total, paidWei: paid, gasPriceWei: cost.price };
}

/** The whole table, for the app's fee display and for monitoring. */
export async function feeTable() {
  const prices = await tokenPrices();
  const rows = {};
  for (const kind of ["transfer", "withdraw", "swap"]) {
    rows[kind] = {};
    for (const t of V1M.tokens) {
      const q = await feeQuote({ kind, token: t.address, calls: 1, hops: 1 });
      rows[kind][t.symbol] = { feePerCall: q.feePerCall, decimals: t.decimals, feeMON: q.feeMON, feeUsd: q.feeUsd };
    }
  }
  return { prices, gas: await gasModel(), gasPriceGwei: Number(ethers.formatUnits(await gasPriceWei(), "gwei")), rows, policy: V1M.fees };
}
