"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

import { api, type FeeQuote, type TokenConfig } from "@/lib/v1m/api";
import { registrationOf, shortAddress } from "@/lib/v1m/wallet";
import { formatAmount, formatUsd } from "@/lib/v1m/format";
import type { Menoid } from "./useMenoid";

/* ────────────────────────────────────────────────────────────
   The private app's building blocks, in the website's light
   lilac-cloud palette: white glass cards, lilac wells, violet ink.
   ──────────────────────────────────────────────────────────── */

export const INK = "#2E1A5C";

export const CARD: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(252,246,255,0.82) 100%)",
  border: "1px solid rgba(255,255,255,0.8)",
  boxShadow:
    "0 40px 80px -36px rgba(64,36,122,0.55), 0 10px 30px -12px rgba(78,47,142,0.22), inset 0 1px 0 rgba(255,255,255,0.95)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
};

export const WELL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(243,234,255,0.92) 0%, rgba(247,240,255,0.88) 100%)",
  border: "1px solid rgba(78,47,142,0.07)",
};

export const PRIMARY: React.CSSProperties = {
  background: "linear-gradient(135deg, #A487EA 0%, #7556CF 50%, #4E2F8E 100%)",
  boxShadow: "0 16px 32px -14px rgba(78,47,142,0.75), inset 0 1px 0 rgba(255,255,255,0.35)",
};

/* ─── tokens ──────────────────────────────────────────────────────────── */

const TOKEN_LOOK: Record<string, { from: string; to: string; glyph: string }> = {
  MON: { from: "#B49CFF", to: "#6E54FF", glyph: "M" },
  mUSDC: { from: "#7FB2F0", to: "#2775CA", glyph: "$" },
  mTKN: { from: "#F7A8D8", to: "#D25EA6", glyph: "T" },
};

export function TokenIcon({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const look = TOKEN_LOOK[symbol] ?? { from: "#C9B0FF", to: "#7F63C7", glyph: symbol.slice(0, 1) };
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-round font-bold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.48,
        background: `linear-gradient(145deg, ${look.from} 0%, ${look.to} 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 3px 8px -3px rgba(46,26,92,0.45)",
      }}
      aria-hidden
    >
      {look.glyph}
    </span>
  );
}

export function TokenSelect({
  tokens,
  value,
  onChange,
  balances,
  balanceLabel = "Balance",
}: {
  tokens: TokenConfig[];
  value: TokenConfig | null;
  onChange: (t: TokenConfig) => void;
  balances?: Record<string, bigint>;
  balanceLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 font-round text-[15px] font-semibold shadow-[0_6px_16px_-8px_rgba(46,26,92,0.45)] transition-transform hover:-translate-y-0.5 active:scale-95"
        style={{ color: INK }}
      >
        {value ? <TokenIcon symbol={value.symbol} size={26} /> : <span className="h-[26px] w-1" />}
        <span>{value ? value.symbol : "Select token"}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          data-lenis-prevent
          className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-[22px] p-1.5"
          style={{ ...CARD, animation: "app-pop 260ms cubic-bezier(0.34,1.4,0.5,1) both", transformOrigin: "top right" }}
        >
          {tokens.map((t) => {
            const bal = balances?.[t.address];
            return (
              <button
                key={t.address}
                type="button"
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors hover:bg-[rgba(243,234,255,0.9)]"
              >
                <TokenIcon symbol={t.symbol} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block font-round text-[14px] font-semibold" style={{ color: INK }}>{t.symbol}</span>
                  <span className="block truncate text-[11px] text-[#2E1A5C]/55">{t.name}</span>
                </span>
                {bal !== undefined && (
                  <span className="text-right">
                    <span className="block font-mono text-[12px]" style={{ color: INK }}>{formatAmount(bal, t.decimals)}</span>
                    <span className="block text-[9px] uppercase tracking-[0.14em] text-[#2E1A5C]/45">{balanceLabel}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── the big amount box ──────────────────────────────────────────────── */

export function AmountBox({
  label,
  value,
  onChange,
  usd,
  readOnly = false,
  right,
  footer,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  usd: number;
  readOnly?: boolean;
  right: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] px-5 pb-4 pt-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(159,125,249,0.28)]" style={WELL}>
      <p className="text-[13px] font-medium text-[#2E1A5C]/70">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <input
          inputMode="decimal"
          placeholder="0"
          value={value}
          readOnly={readOnly}
          onChange={(e) => {
            const v = e.target.value.replace(",", ".");
            if (/^\d*\.?\d*$/.test(v)) onChange?.(v);
          }}
          className="w-full min-w-0 bg-transparent font-round text-[40px] font-semibold leading-none tracking-[-0.02em] outline-none placeholder:text-[#2E1A5C]/25"
          style={{ color: INK, outline: "none" }}
          aria-label={label}
        />
        <div className="shrink-0">{right}</div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-[#2E1A5C]/55">
        <span>{formatUsd(usd)}</span>
        {footer}
      </div>
    </div>
  );
}

export function BalanceHint({ label, amount, decimals, onMax }: { label: string; amount: bigint; decimals: number; onMax?: () => void }) {
  return (
    <span className="flex items-center gap-2">
      <span>
        {label}: <span className="font-mono">{formatAmount(amount, decimals)}</span>
      </span>
      {onMax && amount > 0n && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5E40A8] shadow-sm transition-transform active:scale-95"
        >
          Max
        </button>
      )}
    </span>
  );
}

/* ─── fee / detail rows ───────────────────────────────────────────────── */

export function InfoRows({ rows }: { rows: { label: string; value: React.ReactNode; accent?: boolean }[] }) {
  return (
    <div className="rounded-[24px] px-5 py-1" style={WELL}>
      {rows.map((r, i) => (
        <div key={r.label} className={`flex items-center justify-between gap-4 py-3 ${i < rows.length - 1 ? "border-b border-[rgba(78,47,142,0.08)]" : ""}`}>
          <span className="text-[14px] text-[#2E1A5C]/75">{r.label}</span>
          <span className={`text-right text-[14px] ${r.accent ? "font-semibold text-[#4E2F8E]" : "text-[#2E1A5C]/85"}`}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export function ActionButton({ label, disabled, busy, onClick, onHover }: { label: string; disabled?: boolean; busy?: boolean; onClick?: () => void; onHover?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      disabled={disabled}
      className="btn-spring flex w-full items-center justify-center gap-2.5 rounded-[22px] py-4 font-round text-[17px] font-semibold transition-[filter] disabled:cursor-not-allowed"
      style={
        disabled
          ? { background: "rgba(78,47,142,0.09)", color: "rgba(46,26,92,0.42)", border: "1px solid rgba(78,47,142,0.08)" }
          : { ...PRIMARY, color: "#fff" }
      }
    >
      {busy && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#7556CF] border-t-transparent" />}
      {label}
    </button>
  );
}

/* ─── the panel's one button: Connect → Register → the action ─────────────
   Every panel is on show before a wallet is connected; only this button
   changes. The picker (and the mascot waking up) come from the page. */

export const ConnectContext = createContext<{ open: () => void; wake: () => void }>({ open: () => {}, wake: () => {} });

const CONNECTING: Record<"connecting" | "signing" | "syncing", { label: string; hint: string }> = {
  connecting: { label: "Connecting…", hint: "Approve the connection in your wallet and switch to Monad Testnet." },
  signing: { label: "Sign the message in your wallet", hint: "Once. It costs no gas, and the keys it creates never leave this tab." },
  syncing: { label: "Syncing your private balance…", hint: "Your notes are decrypted here, in your browser. No server learns which ones are yours." },
};

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-[12px] leading-relaxed text-[#2E1A5C]/55">{children}</p>;
}

export function PanelAction({ m, label, disabled, onClick, note }: { m: Menoid; label: string; disabled: boolean; onClick: () => void; note?: React.ReactNode }) {
  const connect = useContext(ConnectContext);
  const running = m.tx?.status === "running";
  if (m.phase === "idle") {
    return (
      <>
        <ActionButton label="Connect wallet" onClick={connect.open} onHover={connect.wake} />
        <Hint>One signature creates your private keys — no new seed phrase, nothing to back up.</Hint>
      </>
    );
  }
  if (m.phase !== "ready") {
    const step = CONNECTING[m.phase];
    return (
      <>
        <ActionButton label={step.label} disabled busy />
        <Hint>{step.hint}</Hint>
      </>
    );
  }
  if (!m.registered) {
    return (
      <>
        <ActionButton label="Register" disabled={running} onClick={() => void m.register()} />
        <RegisterHint />
      </>
    );
  }
  return (
    <>
      <ActionButton label={label} disabled={disabled || running} onClick={onClick} />
      {note}
    </>
  );
}

export function Chip({ children, tone = "violet" }: { children: React.ReactNode; tone?: "violet" | "green" | "amber" | "rose" }) {
  const tones = {
    violet: { bg: "rgba(117,86,207,0.1)", fg: "#4E2F8E" },
    green: { bg: "rgba(34,160,107,0.12)", fg: "#16794F" },
    amber: { bg: "rgba(233,163,35,0.15)", fg: "#9A5B05" },
    rose: { bg: "rgba(225,72,105,0.12)", fg: "#B32748" },
  }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium" style={{ background: tones.bg, color: tones.fg }}>
      {children}
    </span>
  );
}

/* ─── a recipient, checked against the pool as you type ─────────────── */

export type RecipientState =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "checking"; address: string }
  | { status: "registered"; address: string }
  | { status: "unregistered"; address: string }
  | { status: "error"; address: string; message: string };

export function useRecipient(input: string, pool: string | undefined): RecipientState {
  const raw = input.trim();
  const address = raw && ethers.isAddress(raw) ? ethers.getAddress(raw) : null;
  const [checked, setChecked] = useState<RecipientState | null>(null);

  useEffect(() => {
    if (!address || !pool) return;
    let live = true;
    const t = setTimeout(async () => {
      try {
        const reg = await registrationOf(pool, address);
        if (live) setChecked({ status: reg.registered ? "registered" : "unregistered", address });
      } catch (e) {
        if (live) setChecked({ status: "error", address, message: (e as Error).message });
      }
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [address, pool]);

  if (!raw) return { status: "empty" };
  if (!address) return { status: "invalid" };
  if (checked && "address" in checked && checked.address === address) return checked;
  return { status: "checking", address };
}

export function AddressField({
  value,
  onChange,
  placeholder = "0x… wallet address",
  state,
  hints,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  state: RecipientState;
  hints: { registered: string; unregistered: string; unregisteredTone?: "amber" | "rose" };
}) {
  const border =
    state.status === "registered"
      ? "rgba(34,160,107,0.45)"
      : state.status === "unregistered"
        ? hints.unregisteredTone === "rose"
          ? "rgba(225,72,105,0.45)"
          : "rgba(233,163,35,0.55)"
        : state.status === "invalid" || state.status === "error"
          ? "rgba(225,72,105,0.45)"
          : "rgba(78,47,142,0.12)";
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full rounded-[16px] bg-white px-4 py-3 font-mono text-[13px] outline-none transition-[border-color]"
        style={{ border: `1.5px solid ${border}`, color: INK }}
      />
      <div className="mt-2 min-h-[22px] text-[12.5px]">
        {state.status === "checking" && (
          <span className="flex items-center gap-2 text-[#2E1A5C]/55">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#7556CF] border-t-transparent" />
            Checking {shortAddress(state.address)} on the pool…
          </span>
        )}
        {state.status === "invalid" && <Chip tone="rose">Not a valid address</Chip>}
        {state.status === "registered" && <Chip tone="green">✓ {hints.registered}</Chip>}
        {state.status === "unregistered" && <Chip tone={hints.unregisteredTone ?? "amber"}>{hints.unregistered}</Chip>}
        {state.status === "error" && <Chip tone="rose">Could not check this address — try again</Chip>}
      </div>
    </div>
  );
}

/* ─── the relayer's fee, quoted live ──────────────────────────────────────
   Its real cost (gas now + cashing the fee note out later) plus a small
   profit; refreshed every 20 seconds while the panel is open. */

export function useFeeQuote(kind: FeeQuote["kind"], token: string | undefined, calls = 1, hops = 1) {
  const key = token ? `${kind}:${token}:${calls}:${hops}` : null;
  const [state, setState] = useState<{ key: string; quote?: FeeQuote; error?: string } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 20_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!key) return;
    let live = true;
    const [k, tok, c, h] = key.split(":");
    api
      .fee(k as FeeQuote["kind"], tok, Number(c), Number(h))
      .then((quote) => live && setState({ key, quote }))
      .catch((e) => live && setState({ key, error: (e as Error).message }));
    return () => {
      live = false;
    };
  }, [key, tick]);

  const current = state && state.key === key ? state : null;
  return { quote: current?.quote ?? null, error: current?.error ?? null };
}

export function feeValue(quote: FeeQuote | null, error: string | null): React.ReactNode {
  if (error) return <span className="text-[#B32748]">unavailable</span>;
  if (!quote) return <span className="text-[#2E1A5C]/45">quoting…</span>;
  const total = BigInt(quote.feeTotal);
  return (
    <span title={`Covers the relayer's gas (${Number(quote.costMON).toFixed(3)} MON at ${quote.gasPriceGwei} gwei) plus a ${quote.breakdown.profitPct}% margin`}>
      {formatAmount(total, quote.decimals, 6)} {quote.symbol}
      <span className="ml-1 text-[12px] text-[#2E1A5C]/45">≈ {quote.feeUsd < 0.01 ? "<$0.01" : formatUsd(quote.feeUsd)}</span>
      {quote.calls > 1 && <span className="ml-1 text-[12px] text-[#2E1A5C]/45">· {quote.calls} proofs</span>}
    </span>
  );
}

export function RegisterHint() {
  return (
    <p className="text-center text-[12px] leading-relaxed text-[#2E1A5C]/55">
      One-time registration — a single transaction puts your private identity on-chain. Then this button does the rest.
    </p>
  );
}
