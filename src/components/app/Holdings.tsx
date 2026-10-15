"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import type { AppConfig, TokenConfig } from "@/lib/v1m/api";
import type { ActivityItem, WalletView } from "@/lib/v1m/mirror";
import { formatAmount, formatUsd, usdOf } from "@/lib/v1m/format";
import { explorerTx, readProvider, shortAddress } from "@/lib/v1m/wallet";
import { TokenIcon, WELL } from "./ui";

/* ────────────────────────────────────────────────────────────
   A private balance, token by token, and its History — used for
   your own account and for anyone whose full viewing key you hold.
   Everything here was decrypted in this browser.
   ──────────────────────────────────────────────────────────── */

export function totalUsd(view: WalletView | null, tokens: TokenConfig[], prices: Record<string, number>) {
  return tokens.reduce((sum, t) => sum + usdOf(view?.balances[t.address] ?? 0n, t.decimals, prices[t.address]), 0);
}

export function TokenList({ tokens, view, prices, publicBalances }: { tokens: TokenConfig[]; view: WalletView | null; prices: Record<string, number>; publicBalances?: Record<string, bigint> }) {
  // what is held privately first (largest value first), a thin line, then the
  // rest — those with something in the public wallet ahead of the empty ones
  const priv = (t: TokenConfig) => view?.balances[t.address] ?? 0n;
  const value = (t: TokenConfig) => usdOf(priv(t), t.decimals, prices[t.address]);
  const inWallet = (t: TokenConfig) => Number((publicBalances?.[t.address] ?? 0n) > 0n);
  const held = tokens.filter((t) => priv(t) > 0n).sort((a, b) => value(b) - value(a));
  const rest = tokens.filter((t) => priv(t) === 0n).sort((a, b) => inWallet(b) - inWallet(a));

  const row = (t: TokenConfig) => (
    <div key={t.address} className="flex items-center justify-between rounded-[18px] px-3.5 py-2.5" style={WELL}>
      <div className="flex items-center gap-3">
        <TokenIcon symbol={t.symbol} logo={t.logo} size={32} />
        <div>
          <p className="font-round text-[14.5px] font-semibold text-[#2E1A5C]">{t.symbol}</p>
          <p className="text-[11px] text-[#2E1A5C]/50">{publicBalances ? `public ${formatAmount(publicBalances[t.address] ?? 0n, t.decimals)}` : t.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-round text-[14.5px] font-semibold text-[#2E1A5C]">{formatAmount(priv(t), t.decimals)}</p>
        <p className="font-mono text-[11px] text-[#2E1A5C]/50">{formatUsd(value(t))}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      {held.map(row)}
      {held.length > 0 && rest.length > 0 && (
        <div className="mx-10 my-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(78,47,142,0.22), transparent)" }} aria-hidden />
      )}
      {rest.map(row)}
    </div>
  );
}

/* ─── history ──────────────────────────────────────────────────────── */

// "chainId:block" -> timestamp
const blockTimes = new Map<string, number>();

function useBlockTimes(chain: AppConfig | null, blocks: number[]) {
  const [, bump] = useState(0);
  const key = chain ? `${chain.chainId}|${blocks.join(",")}` : "";
  useEffect(() => {
    if (!chain) return;
    let live = true;
    (async () => {
      for (const b of blocks.filter((n) => !blockTimes.has(`${chain.chainId}:${n}`)).slice(0, 15)) {
        try {
          const block = await readProvider(chain).getBlock(b);
          if (block) blockTimes.set(`${chain.chainId}:${b}`, block.timestamp);
        } catch {
          // a time is a nicety
        }
      }
      if (live) bump((n) => n + 1);
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (block: number) => (chain ? blockTimes.get(`${chain.chainId}:${block}`) : undefined);
}

function ago(timestamp: number | undefined): string {
  if (!timestamp) return "";
  const s = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// each kind of activity: its label, colour and icon (the homepage's app mockups use them too)
export const ACTIVITY_LOOK: Record<ActivityItem["kind"], { label: string; tint: string; icon: React.ReactNode }> = {
  masked: { label: "Masked", tint: "#7556CF", icon: <path d="M9 2L15 4.2V8.5C15 12 12.4 14.7 9 16C5.6 14.7 3 12 3 8.5V4.2L9 2Z M6.4 9L8.2 10.8L11.8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> },
  received: { label: "Received privately", tint: "#16794F", icon: <path d="M14 4L4 14M4 14H11M4 14V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
  sent: { label: "Sent privately", tint: "#C2417E", icon: <path d="M4 14L14 4M14 4H7M14 4V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
  unmasked: { label: "Unmasked", tint: "#B26A00", icon: <path d="M2 9C2 9 4.7 4.5 9 4.5C13.3 4.5 16 9 16 9C16 9 13.3 13.5 9 13.5C4.7 13.5 2 9 2 9Z M9 11.1A2.1 2.1 0 1 0 9 6.9A2.1 2.1 0 1 0 9 11.1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /> },
  swapped: { label: "Swapped privately", tint: "#2775CA", icon: <path d="M5 3v12M5 15l-3-3M5 15l3-3M13 15V3M13 3l-3 3M13 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> },
};

// several proofs in one transaction (a batched send) read as one entry
function groupByTx(items: ActivityItem[]): ActivityItem[] {
  const out: ActivityItem[] = [];
  for (const item of items) {
    const prev = out.find((o) => o.txHash === item.txHash && o.kind === item.kind && o.token === item.token);
    if (!prev) {
      out.push({ ...item });
      continue;
    }
    prev.amount += item.amount;
    if (item.fee !== undefined) prev.fee = (prev.fee ?? 0n) + item.fee;
    if (item.amountOut !== undefined) prev.amountOut = (prev.amountOut ?? 0n) + item.amountOut;
  }
  return out;
}

export function History({
  items,
  tokens,
  chain,
  self,
  empty = "Nothing here yet. Mask something to begin.",
}: {
  items: ActivityItem[];
  tokens: TokenConfig[];
  chain: AppConfig | null;
  self?: string | null;
  empty?: string;
}) {
  const grouped = useMemo(() => groupByTx(items), [items]);
  const timeOf = useBlockTimes(chain, useMemo(() => grouped.slice(0, 15).map((a) => a.blockNumber), [grouped]));
  const tokenOf = (address?: string) => tokens.find((t) => address && t.address.toLowerCase() === address.toLowerCase());

  if (!grouped.length) return <p className="py-6 text-center text-[13px] text-[#2E1A5C]/50">{empty}</p>;
  return (
    <div className="flex flex-col gap-1.5">
      {grouped.map((a, i) => {
        const look = ACTIVITY_LOOK[a.kind];
        const token = tokenOf(a.token);
        const out = tokenOf(a.tokenOut);
        const toSomeoneElse = a.kind === "unmasked" && a.counterparty && self && ethers.getAddress(a.counterparty) !== ethers.getAddress(self);
        const label = toSomeoneElse ? "Sent to a public wallet" : look.label;
        const incoming = a.kind === "masked" || a.kind === "received";
        return (
          <a key={`${a.txHash}-${i}`} href={chain ? explorerTx(chain.explorer, a.txHash) : undefined} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[16px] px-3 py-2.5 transition-colors hover:bg-white/80" style={WELL}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: look.tint }}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">{look.icon}</svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[#2E1A5C]">
                {label}
                {a.fromSwap ? " · from a swap" : ""}
              </span>
              <span className="block truncate text-[11px] text-[#2E1A5C]/50">
                {a.kind === "swapped" && out ? `into ${a.amountOut !== undefined ? formatAmount(a.amountOut, out.decimals) : "…"} ${out.symbol}` : a.counterparty ? `to ${shortAddress(a.counterparty)}` : `tx ${shortAddress(a.txHash)}`}
                {timeOf(a.blockNumber) ? ` · ${ago(timeOf(a.blockNumber))}` : ""}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-round text-[13.5px] font-semibold" style={{ color: incoming ? "#16794F" : "#2E1A5C" }}>
                {incoming ? "+" : "−"}
                {token ? formatAmount(a.amount, token.decimals) : a.amount.toString()} {token?.symbol}
              </span>
              {a.fee !== undefined && a.fee > 0n && token && <span className="block text-[10px] text-[#2E1A5C]/45">fee {formatAmount(a.fee, token.decimals, 6)}</span>}
            </span>
          </a>
        );
      })}
    </div>
  );
}
