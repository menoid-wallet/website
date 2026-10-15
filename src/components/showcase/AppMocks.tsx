"use client";

import { ACTIVITY_LOOK, TokenList } from "../app/Holdings";
import { CARD, Chip, INK, InfoRows, PRIMARY, TokenIcon, WELL } from "../app/ui";
import type { TokenConfig } from "@/lib/v1m/api";
import type { ActivityItem, WalletView } from "@/lib/v1m/mirror";

/* ────────────────────────────────────────────────────────────
   The private app as it looks at each step, for the homepage —
   drawn with the app's own pieces (its card and well styles, token
   icons, detail rows, the account box's token list), but still:
   no wallet, no network, nothing to click or focus. The amounts
   are a real session's; the addresses are made up.
   ──────────────────────────────────────────────────────────── */

const token = (symbol: string, name: string, address: string, decimals: number, logo: string): TokenConfig => ({ symbol, name, address, decimals, logo });

const MON = token("MON", "Monad", "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A", 18, "/tokens/mon.svg");
const BOB = token("BOB", "Bob", "0x21E325B059Cd83d4037C82F0F5998Ba2dF3d7777", 18, "/tokens/monad/bob.png");
const USDC = token("USDC", "USD Coin", "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", 6, "/tokens/usdc.svg");
const USDT0 = token("USDT0", "USDT0", "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", 6, "/tokens/usdt0.svg");

// made-up addresses: whoever is "you" in the mockups, and whoever you pay
const YOU = "0x7a1d…c4e2";
const FRIEND = "0x8F3c7E2a91B54d6E0c3A9fD15b7e48C2a6D0b21E";

const wei = (whole: string, decimals = 18) => {
  const [i, f = ""] = whole.split(".");
  return BigInt(i + f.padEnd(decimals, "0").slice(0, decimals));
};

/* ─── the panel's parts ─────────────────────────────────────────────── */

type Tab = "Mask" | "Send" | "Swap" | "Unmask";

function Tabs({ active }: { active: Tab }) {
  return (
    <div className="grid grid-cols-4 rounded-[22px] p-1.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
      {(["Mask", "Send", "Swap", "Unmask"] as Tab[]).map((t) => (
        <span
          key={t}
          className="rounded-[17px] py-2.5 text-center font-round text-[14.5px] font-semibold"
          style={t === active ? { background: "#fff", color: INK, boxShadow: "0 8px 20px -10px rgba(46,26,92,0.45)" } : { color: "rgba(46,26,92,0.5)" }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Panel({ tab, children }: { tab: Tab; children: React.ReactNode }) {
  return (
    <div className="pointer-events-none mx-auto w-full max-w-[420px] select-none" aria-hidden>
      <Tabs active={tab} />
      <div className="mt-2.5 flex flex-col gap-2.5 rounded-[28px] p-2.5" style={CARD}>
        {children}
      </div>
    </div>
  );
}

function TokenChip({ t }: { t: TokenConfig }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 font-round text-[14px] font-semibold shadow-[0_6px_16px_-8px_rgba(46,26,92,0.45)]" style={{ color: INK }}>
      <TokenIcon symbol={t.symbol} logo={t.logo} size={24} />
      {t.symbol}
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
        <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Amount({ label, value, usd, t, hint, faint = false }: { label: string; value: string; usd: string; t: TokenConfig; hint?: React.ReactNode; faint?: boolean }) {
  return (
    <div className="rounded-[22px] px-4 pb-3.5 pt-3.5" style={WELL}>
      <p className="text-[12.5px] font-medium text-[#2E1A5C]/70">{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate font-round text-[30px] font-semibold leading-none tracking-[-0.02em]" style={{ color: faint ? "rgba(46,26,92,0.25)" : INK }}>
          {value}
        </span>
        <span className="shrink-0">
          <TokenChip t={t} />
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11.5px] text-[#2E1A5C]/55">
        <span>{usd}</span>
        {hint}
      </div>
    </div>
  );
}

function Balance({ label, amount }: { label: string; amount: string }) {
  return (
    <span className="flex items-center gap-2">
      <span>
        {label}: <span className="font-mono">{amount}</span>
      </span>
      <span className="rounded-full bg-white px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#5E40A8] shadow-sm">Max</span>
    </span>
  );
}

function Action({ label }: { label: string }) {
  return (
    <span className="flex w-full items-center justify-center rounded-[20px] py-3.5 font-round text-[16px] font-semibold text-white" style={PRIMARY}>
      {label}
    </span>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => <p className="px-2 pb-1 text-center text-[11.5px] leading-relaxed text-[#2E1A5C]/55">{children}</p>;

// the receiving-address pill, one line at the boxes' width
function AddressChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: "rgba(117,86,207,0.1)", color: "#4E2F8E" }}>
      {children}
      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
        <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ─── the five steps ────────────────────────────────────────────────── */

export function RegisterMock() {
  return (
    <Panel tab="Mask">
      <Amount label="You're masking" value="0" usd="$0.00" t={MON} faint hint={<span>Wallet: <span className="font-mono">15</span></span>} />
      <InfoRows
        rows={[
          { label: "Total fee", value: "Gas only · paid in MON" },
          { label: "Total received", value: "—" },
          { label: "Receiving address", value: <AddressChip>Private account • {YOU}</AddressChip> },
        ]}
      />
      <Action label="Register" />
      <Note>One-time registration — a single transaction puts your private identity on-chain. Then this button does the rest.</Note>
    </Panel>
  );
}

export function MaskMock() {
  return (
    <Panel tab="Mask">
      <Amount label="You're masking" value="5" usd="$0.11" t={MON} hint={<Balance label="Wallet" amount="15" />} />
      <InfoRows
        rows={[
          { label: "Total fee", value: "Gas only · paid in MON" },
          { label: "Total received", value: "5 MON", accent: true },
          { label: "Receiving address", value: <AddressChip>Private account • {YOU}</AddressChip> },
        ]}
      />
      <Action label="Mask 5 MON" />
    </Panel>
  );
}

export function SendMock() {
  return (
    <Panel tab="Send">
      <Amount label="You're sending" value="2" usd="$0.05" t={MON} hint={<Balance label="Private" amount="5" />} />
      <div className="rounded-[22px] px-4 pb-3 pt-3.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(78,47,142,0.07)" }}>
        <p className="mb-2 text-[12.5px] font-medium text-[#2E1A5C]/70">To</p>
        <p className="truncate rounded-[14px] bg-white px-3.5 py-2.5 font-mono text-[11.5px]" style={{ border: "1.5px solid rgba(34,160,107,0.45)", color: INK }}>
          {FRIEND}
        </p>
        <p className="mt-2">
          <Chip tone="green">✓ Registered — sent privately</Chip>
        </p>
      </div>
      <InfoRows
        rows={[
          { label: "Relayer fee", value: "0.333 MON ≈ <$0.01" },
          { label: "They receive", value: "2 MON", accent: true },
          { label: "Delivery", value: "Private note" },
        ]}
      />
      <Action label="Send 2 MON privately" />
      <Note>Your address never appears on-chain — the relayer submits it and is paid from the note.</Note>
    </Panel>
  );
}

export function SwapMock() {
  return (
    <Panel tab="Swap">
      <Amount label="You pay" value="2" usd="$0.05" t={MON} hint={<Balance label="Private" amount="2.667" />} />
      <div className="relative z-10 -my-5 flex justify-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-white text-[#5E40A8] shadow-[0_8px_18px_-8px_rgba(46,26,92,0.5)] ring-4 ring-[rgba(250,245,255,0.95)]">
          <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
            <path d="M5 3v12M5 15l-3-3M5 15l3-3M13 15V3M13 3l-3 3M13 3l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <Amount label="You receive" value="636.0446" usd="$0.05" t={BOB} hint={<span className="text-[#2E1A5C]/45">into a new private note</span>} />
      <InfoRows
        rows={[
          {
            label: "Route",
            value: (
              <span className="inline-flex items-center gap-1.5">
                <TokenIcon symbol="MON" logo={MON.logo} size={17} />
                <span className="text-[11px] text-[#2E1A5C]/45">1% →</span>
                <TokenIcon symbol="BOB" logo={BOB.logo} size={17} />
                <span className="text-[11px] text-[#2E1A5C]/45">· Capricorn</span>
              </span>
            ),
          },
          { label: "Minimum received (1%)", value: "629.6842 BOB", accent: true },
          { label: "Relayer fee", value: "0.3778 MON ≈ <$0.01" },
        ]}
      />
      <div className="flex items-center justify-between px-1 text-[11.5px] text-[#2E1A5C]/60">
        <span>Slippage</span>
        <span className="flex gap-1.5">
          {["0.5%", "1%", "2%"].map((s) => (
            <span key={s} className="rounded-full px-2.5 py-0.5 font-semibold" style={s === "1%" ? { background: "#5E40A8", color: "#fff" } : { background: "rgba(117,86,207,0.1)", color: "#4E2F8E" }}>
              {s}
            </span>
          ))}
        </span>
      </div>
      <Action label="Swap 2 MON privately" />
    </Panel>
  );
}

export function UnmaskMock() {
  return (
    <Panel tab="Unmask">
      <Amount label="You're unmasking" value="200" usd="$0.01" t={BOB} hint={<Balance label="Private" amount="636.0446" />} />
      <InfoRows
        rows={[
          { label: "Relayer fee", value: "106.66 BOB ≈ <$0.01" },
          { label: "Total received", value: "200 BOB", accent: true },
          { label: "Receiving address", value: <AddressChip>Your wallet • {YOU}</AddressChip> },
        ]}
      />
      <Action label="Unmask 200 BOB" />
    </Panel>
  );
}

/* ─── the account box ───────────────────────────────────────────────── */

function Segmented({ options, active }: { options: string[]; active: string }) {
  return (
    <span className="flex rounded-full p-1" style={WELL}>
      {options.map((o) => (
        <span
          key={o}
          className="whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-semibold"
          style={o === active ? { background: "#fff", color: "#2E1A5C", boxShadow: "0 3px 10px -4px rgba(46,26,92,0.35)" } : { color: "rgba(46,26,92,0.55)" }}
        >
          {o}
        </span>
      ))}
    </span>
  );
}

const view = (balances: Record<string, bigint>): WalletView => ({ notes: [], unspent: [], balances, activity: [] });

export function AccountMock() {
  return (
    <div className="pointer-events-none mx-auto w-full max-w-[360px] select-none rounded-[28px] p-4 sm:p-5" style={CARD} aria-hidden>
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <p className="font-round text-[10px] font-bold uppercase tracking-[0.42em] text-[#4E2F8E]/60">Hidden treasure</p>
          <p className="font-round mt-1.5 text-[34px] font-bold leading-none tracking-[-0.03em] text-[#3B2570]">$0.03</p>
          <p className="mt-2 flex items-center gap-1.5 whitespace-nowrap font-mono text-[11.5px] text-[#2E1A5C]/60">
            {YOU}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#5E40A8]">
              <rect x="4" y="4" width="6.6" height="6.6" rx="1.7" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5v4A1.5 1.5 0 0 0 2.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <Chip tone="green">✓ registered</Chip>
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#5E40A8]/80 underline decoration-dotted underline-offset-[3px]">Copy viewing key</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#4E2F8E] shadow-sm">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <Segmented options={["Tokens", "History · 4"]} active="Tokens" />
        <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-[#B32748]" style={{ background: "rgba(225,72,105,0.08)" }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.2v4.3M3.3 2.9a4.2 4.2 0 1 0 5.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Disconnect
        </span>
      </div>
      <div className="mt-2">
        <TokenList
          tokens={[MON, BOB, USDC, USDT0]}
          view={view({ [MON.address]: wei("0.2892"), [BOB.address]: wei("329.384") })}
          prices={{ [MON.address]: 0.0228, [BOB.address]: 0.0000702, [USDC.address]: 1, [USDT0.address]: 1 }}
          publicBalances={{ [MON.address]: wei("10"), [BOB.address]: wei("200"), [USDC.address]: 0n, [USDT0.address]: 0n }}
        />
      </div>

      <div className="mt-3 border-t border-[rgba(78,47,142,0.08)] px-1 pt-3">
        <p className="text-[10.5px] leading-relaxed text-[#2E1A5C]/45">
          Your viewing key shows everything and spends nothing — share it only with someone who should see your private activity.
        </p>
        <p className="mt-2 text-[12px] font-semibold text-[#5E40A8]">View someone&apos;s private activity ›</p>
      </div>
    </div>
  );
}

/* ─── someone else's activity, from their viewing key ───────────────── */

type Row = { kind: ActivityItem["kind"]; sub: string; amount: string; fee?: string };

function HistoryRows({ rows }: { rows: Row[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => {
        const look = ACTIVITY_LOOK[r.kind];
        const incoming = r.kind === "masked" || r.kind === "received";
        return (
          <div key={r.sub} className="flex items-center gap-3 rounded-[16px] px-3 py-2.5" style={WELL}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: look.tint }}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                {look.icon}
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-[#2E1A5C]">{look.label}</span>
              <span className="block truncate text-[11px] text-[#2E1A5C]/50">{r.sub}</span>
            </span>
            <span className="text-right">
              <span className="block font-round text-[13.5px] font-semibold" style={{ color: incoming ? "#16794F" : "#2E1A5C" }}>
                {r.amount}
              </span>
              {r.fee && <span className="block text-[10px] text-[#2E1A5C]/45">fee {r.fee}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ViewingKeyMock() {
  return (
    <div className="pointer-events-none mx-auto w-full max-w-[360px] select-none rounded-[28px] p-4 sm:p-5" style={CARD} aria-hidden>
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#5E40A8]">‹ My account</p>
      <p className="font-round mt-2.5 text-[17px] font-semibold text-[#2E1A5C]">View someone&apos;s private activity</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-[#2E1A5C]/55">
        Paste the full viewing key they shared. It shows their balance and every payment — and cannot spend a thing. It is decrypted here, never sent anywhere.
      </p>
      <p className="mt-3 break-all rounded-[16px] bg-white px-3.5 py-3 font-mono text-[10.5px] leading-relaxed text-[#2E1A5C]/80" style={{ border: "1.5px solid rgba(78,47,142,0.12)" }}>
        menoid-vk1:eyJraW5kIjoiZnVsbCIsImFkZHJlc3MiOiIweDhGM2M3RTJhOTFCNTRkNkUwYzNBOWZEMTViN2U0OEMyYTZEMGIyMUUi…
      </p>
      <span className="mt-3 flex w-full items-center justify-center rounded-[16px] py-2.5 font-round text-[14px] font-semibold text-white" style={PRIMARY}>
        View
      </span>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11.5px] text-[#2E1A5C]/70">0x8F3c…b21E</p>
          <p className="font-round text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#3B2570]">$0.06</p>
        </div>
        <Chip tone="green">✓ key matches their account</Chip>
      </div>
      <div className="mt-3 flex justify-end">
        <Segmented options={["Tokens", "History · 3"]} active="History · 3" />
      </div>
      <div className="mt-2">
        <HistoryRows
          rows={[
            { kind: "received", sub: "tx 0x5b1e…77ac · 36m ago", amount: "+2 MON" },
            { kind: "sent", sub: "to 0x2c94…e0F1 · 2h ago", amount: "−2 MON", fee: "0.333" },
            { kind: "masked", sub: "tx 0x9d40…13b7 · 2h ago", amount: "+3 MON" },
          ]}
        />
      </div>
    </div>
  );
}
