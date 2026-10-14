import { ethers } from "ethers";

/** "1.25" -> base units; throws on anything that is not a plain decimal. */
export function parseAmount(value: string, decimals: number): bigint {
  const v = value.trim();
  if (!/^\d*\.?\d*$/.test(v) || v === "" || v === ".") throw new Error("Enter an amount");
  const [whole, frac = ""] = v.split(".");
  if (frac.length > decimals) throw new Error(`At most ${decimals} decimals`);
  return ethers.parseUnits(`${whole || "0"}.${frac || "0"}`, decimals);
}

export function tryParseAmount(value: string, decimals: number): bigint | null {
  try {
    return parseAmount(value, decimals);
  } catch {
    return null;
  }
}

/** Base units -> a short human string ("1,234.5678", "0.0012", "< 0.0001"). */
export function formatAmount(amount: bigint, decimals: number, maxFraction = 4): string {
  const n = Number(ethers.formatUnits(amount, decimals));
  if (n === 0) return "0";
  if (n > 0 && n < 10 ** -maxFraction) return `< ${(10 ** -maxFraction).toFixed(maxFraction)}`;
  return n.toLocaleString("en-US", { maximumFractionDigits: n < 1 ? Math.max(maxFraction, 4) : maxFraction });
}

/** Exact, for an input box: no grouping, no rounding beyond the token's decimals. */
export function amountForInput(amount: bigint, decimals: number): string {
  const s = ethers.formatUnits(amount, decimals);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const usdOf = (amount: bigint, decimals: number, price: number | undefined) =>
  price ? Number(ethers.formatUnits(amount, decimals)) * price : 0;
