"use client";

import { useEffect, useRef, useState } from "react";

import type { ChainInfo } from "@/lib/v1m/api";
import { CARD } from "./ui";

/* ────────────────────────────────────────────────────────────
   The network the app is on, in the header next to the private
   balance. Each chain has its own pool: its own registration,
   notes and balance. The same signature's keys work on all of
   them.
   ──────────────────────────────────────────────────────────── */

export function ChainMark({ chain, size = 24 }: { chain: Pick<ChainInfo, "id" | "shortName">; size?: number }) {
  if (chain.id.startsWith("monad")) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <defs>
          <linearGradient id="chain-monad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A18BFF" />
            <stop offset="100%" stopColor="#6E54FF" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#chain-monad)" />
        <rect x="9.6" y="9.6" width="12.8" height="12.8" rx="3.6" transform="rotate(45 16 16)" fill="none" stroke="#fff" strokeWidth="2.6" />
      </svg>
    );
  }
  if (chain.id.startsWith("base")) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <circle cx="16" cy="16" r="16" fill="#0052FF" />
        <rect x="9.5" y="9.5" width="13" height="13" rx="2.4" fill="#fff" />
      </svg>
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#7556CF] font-round font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      {chain.shortName.slice(0, 1)}
    </span>
  );
}

export default function ChainSwitcher({
  chains,
  value,
  onChange,
  disabled = false,
}: {
  chains: ChainInfo[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = chains.find((c) => c.id === value);
  if (!current) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={disabled ? "Finish the current step to switch network" : `Network: ${current.name}`}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-[18px] bg-white/90 py-2 pl-2 pr-2.5 shadow-[0_8px_22px_-12px_rgba(64,36,122,0.55)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:gap-2 sm:pr-3"
      >
        <ChainMark chain={current} size={26} />
        <span className="hidden font-round text-[14px] font-semibold text-[#2E1A5C] sm:inline">{current.shortName}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={`text-[#4E2F8E] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Network"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-[22px] p-1.5"
          style={{ ...CARD, animation: "app-pop 260ms cubic-bezier(0.34,1.4,0.5,1) both", transformOrigin: "top right" }}
        >
          <p className="px-3 pb-1 pt-2 font-round text-[10px] font-bold uppercase tracking-[0.32em] text-[#4E2F8E]/55">Network</p>
          {chains.map((c) => (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={c.id === value}
              onClick={() => {
                setOpen(false);
                onChange(c.id);
              }}
              className="flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors hover:bg-[rgba(243,234,255,0.9)]"
            >
              <ChainMark chain={c} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block font-round text-[14px] font-semibold text-[#2E1A5C]">{c.name}</span>
                <span className="block text-[11px] text-[#2E1A5C]/50">
                  {c.nativeSymbol} · {c.keyNetwork === "testnet" ? "testnet, test tokens" : "mainnet"}
                </span>
              </span>
              {c.id === value && (
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-[#16794F]">
                  <path d="M2.5 6.3L5 8.7L9.6 3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
          <p className="px-3 pb-2 pt-1 text-[10.5px] leading-relaxed text-[#2E1A5C]/45">
            Each network has its own private balance. Your keys come from the same signature everywhere.
          </p>
        </div>
      )}
    </div>
  );
}
