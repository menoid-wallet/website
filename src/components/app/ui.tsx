"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ethers } from "ethers";

import type { AppConfig, ChainApi, FeeQuote, TokenConfig, TokenLookup } from "@/lib/v1m/api";
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
  ETH: { from: "#A9B8F5", to: "#627EEA", glyph: "Ξ" },
  mUSDC: { from: "#7FB2F0", to: "#2775CA", glyph: "$" },
  USDC: { from: "#7FB2F0", to: "#2775CA", glyph: "$" },
  mTKN: { from: "#F7A8D8", to: "#D25EA6", glyph: "T" },
};

/** The token's logo (served by this site), or a lettered badge when it has none. */
export function TokenIcon({ symbol, logo, size = 28 }: { symbol: string; logo?: string; size?: number }) {
  if (logo) {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-full bg-white"
        style={{ width: size, height: size, boxShadow: "0 3px 8px -3px rgba(46,26,92,0.45)" }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} alt="" width={size} height={size} className="h-full w-full object-cover" draggable={false} />
      </span>
    );
  }
  const look = TOKEN_LOOK[symbol] ?? { from: "#C9B0FF", to: "#7F63C7", glyph: symbol.slice(0, 1).toUpperCase() };
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

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/* The token picker: the chain's popular tokens, search, and any token by
   pasting its address (looked up on the chain through the backend). A token
   the pool does not take, or the relayer cannot price, shows why it cannot be
   picked for this action. Opens over the page (a portal: the glass cards
   would otherwise clip it). */
export function TokenSelect({
  tokens,
  value,
  onChange,
  balances,
  balanceLabel = "Balance",
  blockReason,
  onLookup,
  onAdd,
  onRemove,
}: {
  tokens: TokenConfig[];
  value: TokenConfig | null;
  onChange: (t: TokenConfig) => void;
  balances?: Record<string, bigint>;
  balanceLabel?: string;
  blockReason?: (t: TokenConfig) => string | null;
  onLookup?: (address: string) => Promise<TokenLookup>;
  onAdd?: (t: TokenLookup) => void;
  onRemove?: (address: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [memesOnly, setMemesOnly] = useState(false);
  const [lookup, setLookup] = useState<{ key: string; token?: TokenLookup; error?: string } | null>(null);
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const hasMemes = tokens.some((t) => t.meme);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const q = query.trim();
  const needle = q.toLowerCase();
  const isAddress = ethers.isAddress(q);
  const shown = tokens.filter((t) =>
    q ? (isAddress ? same(t.address, q) : `${t.symbol} ${t.name}`.toLowerCase().includes(needle)) : !memesOnly || !hasMemes || t.meme
  );
  // a pasted address the list does not have: ask the chain, half a second after typing stops
  const lookupKey = isAddress && !shown.length && onLookup ? ethers.getAddress(q) : null;
  useEffect(() => {
    if (!lookupKey || !onLookup) return;
    let live = true;
    const t = setTimeout(async () => {
      try {
        const token = await onLookup(lookupKey);
        if (live) setLookup({ key: lookupKey, token });
      } catch (e) {
        if (live) setLookup({ key: lookupKey, error: (e as Error).message });
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [lookupKey, onLookup]);
  const found = lookupKey && lookup?.key === lookupKey ? lookup : null;

  const sorted = [...shown].sort((a, b) => Number((balances?.[b.address] ?? 0n) > 0n) - Number((balances?.[a.address] ?? 0n) > 0n));
  const flagged = tokens.filter((t) => t.popular && !t.custom);
  const popular = (flagged.length ? flagged : tokens.filter((t) => !t.custom)).slice(0, 6);
  const pick = (t: TokenConfig) => {
    if (blockReason?.(t)) return;
    onChange(t);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 font-round text-[15px] font-semibold shadow-[0_6px_16px_-8px_rgba(46,26,92,0.45)] transition-transform hover:-translate-y-0.5 active:scale-95"
        style={{ color: INK }}
      >
        {value ? <TokenIcon symbol={value.symbol} logo={value.logo} size={26} /> : <span className="h-[26px] w-1" />}
        <span>{value ? value.symbol : "Select token"}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[9vh]" style={{ background: "rgba(46,26,92,0.32)", backdropFilter: "blur(4px)", animation: "app-fade 180ms ease both" }} onMouseDown={close}>
            <div
              role="dialog"
              aria-label="Select a token"
              className="w-full max-w-[420px] rounded-[28px] p-4"
              style={{ ...CARD, animation: "app-pop 260ms cubic-bezier(0.34,1.4,0.5,1) both" }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-round text-[17px] font-semibold" style={{ color: INK }}>Select a token</p>
                <button type="button" onClick={close} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#4E2F8E] shadow-sm transition-transform hover:rotate-90">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or paste a token address"
                spellCheck={false}
                className="mt-3 w-full rounded-[16px] bg-white px-4 py-3 text-[14px] outline-none"
                style={{ border: "1.5px solid rgba(78,47,142,0.12)", color: INK }}
              />

              {!q && hasMemes && (
                <div className="mt-3 flex w-fit rounded-full p-1" style={WELL}>
                  {[
                    { id: false, label: "All tokens" },
                    { id: true, label: "Memes" },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => setMemesOnly(o.id)}
                      className="rounded-full px-3 py-1 text-[12px] font-semibold transition-all"
                      style={memesOnly === o.id ? { background: "#fff", color: "#2E1A5C", boxShadow: "0 3px 10px -4px rgba(46,26,92,0.35)" } : { color: "rgba(46,26,92,0.55)" }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}

              {!q && !memesOnly && popular.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {popular.map((t) => (
                    <button
                      key={t.address}
                      type="button"
                      onClick={() => pick(t)}
                      disabled={Boolean(blockReason?.(t))}
                      className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 text-[12.5px] font-semibold shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                      style={{ color: INK, outline: value && same(value.address, t.address) ? "2px solid #9F7DF9" : undefined }}
                    >
                      <TokenIcon symbol={t.symbol} logo={t.logo} size={20} />
                      {t.symbol}
                    </button>
                  ))}
                </div>
              )}

              <div className="app-scroll mt-3 max-h-[46vh] overflow-y-auto overscroll-contain pr-1" data-lenis-prevent>
                {sorted.map((t) => {
                  const bal = balances?.[t.address];
                  const reason = blockReason?.(t) ?? null;
                  return (
                    <div key={t.address} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => pick(t)}
                        disabled={Boolean(reason)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-[16px] px-2.5 py-2.5 text-left transition-colors hover:bg-[rgba(243,234,255,0.9)] disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        style={{ opacity: reason ? 0.5 : 1 }}
                      >
                        <TokenIcon symbol={t.symbol} logo={t.logo} size={32} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 font-round text-[14px] font-semibold" style={{ color: INK }}>
                            {t.symbol}
                            {t.custom && <span className="rounded-full bg-[rgba(117,86,207,0.12)] px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-[#4E2F8E]">added</span>}
                            {t.meme && <span className="rounded-full bg-[rgba(255,170,90,0.18)] px-1.5 py-px text-[9px] font-bold uppercase tracking-[0.1em] text-[#A0521A]">meme</span>}
                          </span>
                          <span className="block truncate text-[11px] text-[#2E1A5C]/55">{reason ?? t.name}</span>
                        </span>
                        {bal !== undefined && bal > 0n && (
                          <span className="text-right">
                            <span className="block font-mono text-[12px]" style={{ color: INK }}>{formatAmount(bal, t.decimals)}</span>
                            <span className="block text-[9px] uppercase tracking-[0.14em] text-[#2E1A5C]/45">{balanceLabel}</span>
                          </span>
                        )}
                      </button>
                      {t.custom && onRemove && (
                        <button type="button" onClick={() => onRemove(t.address)} title="Remove from your list" aria-label={`Remove ${t.symbol}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#2E1A5C]/40 transition-colors hover:bg-white hover:text-[#B32748]">
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}

                {lookupKey && !found && (
                  <p className="flex items-center gap-2 px-2.5 py-4 text-[13px] text-[#2E1A5C]/55">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#7556CF] border-t-transparent" />
                    Looking that address up on the chain…
                  </p>
                )}
                {found?.error && <p className="px-2.5 py-4 text-[13px] text-[#B32748]">{found.error}</p>}
                {found?.token && (
                  <div className="mt-1 rounded-[18px] p-3" style={WELL}>
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={found.token.symbol} logo={found.token.logo} size={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-round text-[15px] font-semibold" style={{ color: INK }}>{found.token.symbol}</span>
                        <span className="block truncate text-[11px] text-[#2E1A5C]/55">{found.token.name} · {shortAddress(found.token.address)}</span>
                      </span>
                      {onAdd && (
                        <button
                          type="button"
                          onClick={() => {
                            onAdd(found.token!);
                            const added: TokenConfig = { ...found.token!, custom: true };
                            if (!blockReason?.(added)) onChange(added);
                            close();
                          }}
                          className="btn-spring rounded-[14px] px-4 py-2 font-round text-[13px] font-semibold text-white"
                          style={PRIMARY}
                        >
                          Add
                        </button>
                      )}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <Chip tone={found.token.enabled ? "green" : "amber"}>{found.token.enabled ? "✓ the pool accepts it" : "not accepted by the pool yet"}</Chip>
                      <Chip tone={found.token.relayable ? "green" : "amber"}>{found.token.relayable ? "✓ has a market price" : "no market price yet"}</Chip>
                    </div>
                    {(!found.token.enabled || !found.token.relayable) && (
                      <p className="mt-2 text-[11px] leading-relaxed text-[#2E1A5C]/55">
                        You can add it to watch it. Masking it needs the pool to accept it, and private sends need a price for the relayer&apos;s fee.
                      </p>
                    )}
                  </div>
                )}
                {!sorted.length && !lookupKey && <p className="px-2.5 py-4 text-[13px] text-[#2E1A5C]/50">No token matches. Paste its address to look it up.</p>}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
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
  connecting: { label: "Connecting…", hint: "Approve the connection in your wallet, and the network switch if it asks." },
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

export function useRecipient(input: string, config: AppConfig | null): RecipientState {
  const raw = input.trim();
  const address = raw && ethers.isAddress(raw) ? ethers.getAddress(raw) : null;
  // registration is per pool: an answer for one chain never shows on another
  const key = address && config ? `${config.chainId}:${address}` : null;
  const [checked, setChecked] = useState<{ key: string; state: RecipientState } | null>(null);

  useEffect(() => {
    if (!key || !config || !address) return;
    let live = true;
    const t = setTimeout(async () => {
      try {
        const reg = await registrationOf(config, config.pool, address);
        if (live) setChecked({ key, state: { status: reg.registered ? "registered" : "unregistered", address } });
      } catch (e) {
        if (live) setChecked({ key, state: { status: "error", address, message: (e as Error).message } });
      }
    }, 350);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!raw) return { status: "empty" };
  if (!address) return { status: "invalid" };
  if (checked && checked.key === key) return checked.state;
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

export function useFeeQuote(api: ChainApi | null, kind: FeeQuote["kind"], token: string | undefined, calls = 1, hops = 1) {
  const key = token && api ? `${api.chain}:${kind}:${token}:${calls}:${hops}` : null;
  const [state, setState] = useState<{ key: string; quote?: FeeQuote; error?: string } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 20_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!key || !api) return;
    let live = true;
    const [, k, tok, c, h] = key.split(":");
    api
      .fee(k as FeeQuote["kind"], tok, Number(c), Number(h))
      .then((quote) => live && setState({ key, quote }))
      .catch((e) => live && setState({ key, error: (e as Error).message }));
    return () => {
      live = false;
    };
  }, [key, tick, api]);

  const current = state && state.key === key ? state : null;
  return { quote: current?.quote ?? null, error: current?.error ?? null };
}

export function feeValue(quote: FeeQuote | null, error: string | null): React.ReactNode {
  if (error) return <span className="text-[#B32748]">unavailable</span>;
  if (!quote) return <span className="text-[#2E1A5C]/45">quoting…</span>;
  const total = BigInt(quote.feeTotal);
  return (
    <span title={`Covers the relayer's gas (${Number(quote.costNative).toPrecision(3)} ${quote.nativeSymbol} at ${quote.gasPriceGwei} gwei) plus a ${quote.breakdown.profitPct}% margin`}>
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
