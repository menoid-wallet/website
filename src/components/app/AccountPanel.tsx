"use client";

import { useState } from "react";

import RollingNumber from "./RollingNumber";
import { History, TokenList, totalUsd } from "./Holdings";
import type { InspectResult, Menoid } from "./useMenoid";
import { CARD, Chip, PRIMARY, WELL } from "./ui";
import { formatUsd } from "@/lib/v1m/format";
import { shortAddress } from "@/lib/v1m/wallet";

/* ────────────────────────────────────────────────────────────
   The account box (click the address): the hidden treasure —
   total, tokens, history — and, from its last line, a viewer for
   anyone's activity from their full viewing key.
   ──────────────────────────────────────────────────────────── */

// tokens and history scroll inside the box, so it keeps one size
const LIST = "app-scroll mt-2 h-[min(248px,38vh)] overflow-y-auto overscroll-contain pr-1";

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-full p-1" style={WELL}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className="whitespace-nowrap rounded-full px-3.5 py-1 text-[12px] font-semibold transition-all"
          style={value === o.id ? { background: "#fff", color: "#2E1A5C", boxShadow: "0 3px 10px -4px rgba(46,26,92,0.35)" } : { color: "rgba(46,26,92,0.55)" }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, text: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1600);
    } catch {
      // clipboard blocked
    }
  };
  return { copied, copy };
}

function CopyIcon({ done }: { done: boolean }) {
  return done ? (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 6.3L5 8.7L9.6 3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="4" y="4" width="6.6" height="6.6" rx="1.7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5v4A1.5 1.5 0 0 0 2.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function Inspector({ m, onBack }: { m: Menoid; onBack: () => void }) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InspectResult | null>(null);
  const [tab, setTab] = useState<"tokens" | "history">("history");
  const tokens = m.tokens;

  const view = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await m.inspectViewingKey(key));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#5E40A8]">
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M6.5 1.5L2 6l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        My account
      </button>
      <p className="font-round text-[17px] font-semibold text-[#2E1A5C]">View someone&apos;s private activity</p>
      <p className="mt-1 text-[12px] leading-relaxed text-[#2E1A5C]/55">
        Paste the full viewing key they shared. It shows their balance and every payment — and cannot spend a thing. It is decrypted here, never sent anywhere.
      </p>
      <textarea
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="menoid-vk1:…"
        rows={3}
        spellCheck={false}
        className="mt-3 w-full resize-none rounded-[16px] bg-white px-3.5 py-3 font-mono text-[11.5px] text-[#2E1A5C] outline-none"
        style={{ border: `1.5px solid ${error ? "rgba(225,72,105,0.45)" : "rgba(78,47,142,0.12)"}` }}
      />
      {error && <p className="mt-1.5 text-[12px] text-[#B32748]">{error}</p>}
      <button
        type="button"
        onClick={view}
        disabled={!key.trim() || busy}
        className="btn-spring mt-3 w-full rounded-[16px] py-3 font-round text-[14.5px] font-semibold text-white disabled:opacity-50"
        style={PRIMARY}
      >
        {busy ? "Decrypting…" : "View"}
      </button>

      {result && (
        <div className="mt-4" style={{ animation: "app-rise 420ms cubic-bezier(0.22,1,0.36,1) both" }}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[12px] text-[#2E1A5C]/70">{shortAddress(result.address)}</p>
              <p className="font-round text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#3B2570]">{formatUsd(totalUsd(result.view, tokens, m.prices))}</p>
            </div>
            <Chip tone={result.registered ? "green" : "amber"}>{result.registered ? "✓ key matches their account" : "older identity"}</Chip>
          </div>
          <div className="mt-3 flex justify-end">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { id: "tokens", label: "Tokens" },
                { id: "history", label: `History · ${result.view.activity.length}` },
              ]}
            />
          </div>
          <div className={LIST} data-lenis-prevent>
            {tab === "tokens" ? <TokenList tokens={tokens} view={result.view} prices={m.prices} /> : <History items={result.view.activity} tokens={tokens} chain={m.config} self={result.address} empty="No private activity for this key yet." />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPanel({ m, onClose }: { m: Menoid; onClose: () => void }) {
  const [mode, setMode] = useState<"mine" | "inspect">("mine");
  const [tab, setTab] = useState<"tokens" | "history">("tokens");
  const { copied, copy } = useCopy();
  const tokens = m.tokens;
  const total = totalUsd(m.view, tokens, m.prices);
  const activity = m.view?.activity ?? [];

  return (
    <div
      className="absolute right-0 top-full z-40 mt-2 w-[min(400px,calc(100vw-24px))] rounded-[28px] p-4 sm:p-5"
      style={{ ...CARD, animation: "app-pop 280ms cubic-bezier(0.34,1.4,0.5,1) both", transformOrigin: "top right" }}
      role="dialog"
      aria-label="Your account"
    >
      {mode === "inspect" ? (
        <Inspector m={m} onBack={() => setMode("mine")} />
      ) : (
        <>
          <div className="flex justify-between gap-3">
            <div className="min-w-0">
              <p className="font-round text-[10px] font-bold uppercase tracking-[0.42em] text-[#4E2F8E]/60">Hidden treasure</p>
              <p className="font-round mt-1.5 text-[34px] font-bold leading-none tracking-[-0.03em] text-[#3B2570]">
                <RollingNumber value={formatUsd(total)} height={38} />
              </p>
              <p className="mt-2 flex items-center gap-1 whitespace-nowrap font-mono text-[11.5px] text-[#2E1A5C]/60">
                {shortAddress(m.address ?? "")}
                <button
                  type="button"
                  onClick={() => copy("address", m.address)}
                  title={copied === "address" ? "Copied" : "Copy address"}
                  aria-label="Copy address"
                  className="mr-1 flex h-6 w-6 items-center justify-center rounded-full text-[#5E40A8] transition-colors hover:bg-white"
                >
                  <CopyIcon done={copied === "address"} />
                </button>
                {m.registered ? <Chip tone="green">✓ registered</Chip> : <Chip tone="amber">not registered</Chip>}
              </p>
              {m.keys && (
                <button
                  type="button"
                  onClick={() => copy("vk", m.viewingKey())}
                  className="mt-1 text-[11px] font-medium text-[#5E40A8]/80 underline decoration-dotted underline-offset-[3px] transition-colors hover:text-[#4E2F8E]"
                >
                  {copied === "vk" ? "Viewing key copied ✓" : "Copy viewing key"}
                </button>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#4E2F8E] shadow-sm transition-transform hover:rotate-90">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { id: "tokens", label: "Tokens" },
                { id: "history", label: `History${activity.length ? ` · ${activity.length}` : ""}` },
              ]}
            />
            <button
              type="button"
              onClick={() => {
                onClose();
                m.disconnect();
              }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#B32748] transition-colors hover:bg-white"
              style={{ background: "rgba(225,72,105,0.08)" }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1.2v4.3M3.3 2.9a4.2 4.2 0 1 0 5.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Disconnect
            </button>
          </div>
          <div className={LIST} data-lenis-prevent>
            {tab === "tokens" ? (
              <TokenList tokens={tokens} view={m.view} prices={m.prices} publicBalances={m.publicBalances} />
            ) : (
              <History items={activity} tokens={tokens} chain={m.config} self={m.address} />
            )}
          </div>

          <div className="mt-3 border-t border-[rgba(78,47,142,0.08)] px-1 pt-3">
            <p className="text-[10.5px] leading-relaxed text-[#2E1A5C]/45">
              Your viewing key shows everything and spends nothing — share it only with someone who should see your private activity.
            </p>
            <button
              type="button"
              onClick={() => setMode("inspect")}
              className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#5E40A8] transition-colors hover:text-[#4E2F8E]"
            >
              View someone&apos;s private activity
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3.5 1.5L7 5L3.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
