"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import AnimatedLogo from "../AnimatedLogo";
import CloudChip from "../CloudChip";
import MenoidWordmark from "../MenoidWordmark";
import RollingNumber from "./RollingNumber";
import AccountPanel from "./AccountPanel";
import ChainSwitcher from "./ChainSwitcher";
import { totalUsd } from "./Holdings";
import type { Menoid } from "./useMenoid";
import { PRIMARY } from "./ui";
import { formatUsd } from "@/lib/v1m/format";
import { shortAddress } from "@/lib/v1m/wallet";
import type { KeyNetwork } from "@/lib/v1m/protocol";

/* ────────────────────────────────────────────────────────────
   Header: the mark (home), the network, and — once connected —
   the private balance in $ and the address. Either opens the
   account box.
   ──────────────────────────────────────────────────────────── */

export default function AppHeader({ m, network, asleep, onConnect, onWake }: { m: Menoid; network: KeyNetwork; asleep: boolean; onConnect: () => void; onWake: () => void }) {
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

  const tokens = m.tokens;
  const total = useMemo(() => totalUsd(m.view, tokens, m.prices), [m.view, tokens, m.prices]);
  const connected = m.phase === "ready" && m.address;

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-6 sm:pt-7">
      {/* the mark, exactly as in the website's nav — its eyes stay shut
          until the cursor first touches a Connect button */}
      <Link href="/" className="shrink-0" aria-label="Menoid home">
        <CloudChip className="gap-2 px-3.5 py-1.5 transition-transform duration-300 hover:-translate-y-0.5">
          <AnimatedLogo
            className={`h-10 w-10 sm:h-10 sm:w-10 ${asleep ? "app-logo-asleep" : ""}`}
            style={{ filter: "drop-shadow(0 2px 4px rgba(64,36,122,0.28))" }}
          />
          <MenoidWordmark tone="violet" className="h-[15px] w-auto sm:h-[17px]" />
        </CloudChip>
      </Link>

      <span className="hidden items-center gap-2 rounded-full bg-white/45 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#4E2F8E] ring-1 ring-white/60 backdrop-blur md:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-[#22A06B] shadow-[0_0_0_3px_rgba(34,160,107,0.2)]" />
        Private mode · {m.config?.name ?? "…"}
      </span>

      <div className="flex items-center gap-2">
        {/* the network, left of the private balance */}
        <ChainSwitcher
          network={network}
          chains={m.chains}
          value={m.chainId}
          onChange={(id) => void m.selectChain(id)}
          disabled={m.tx?.status === "running" || (m.phase !== "idle" && m.phase !== "ready")}
        />
        {connected ? (
          <div ref={ref} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="whitespace-nowrap rounded-[18px] bg-white/90 px-3 py-1.5 text-right shadow-[0_8px_22px_-12px_rgba(64,36,122,0.55)] transition-transform hover:-translate-y-0.5 sm:px-4"
              title="Your private balance"
            >
              <span className="block font-round text-[17px] font-semibold leading-tight text-[#2E1A5C]">
                <RollingNumber value={formatUsd(total)} height={22} />
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#2E1A5C]/50">Private</span>
            </button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="hidden items-center gap-2 whitespace-nowrap rounded-[18px] px-3 py-3 font-mono text-[12px] font-semibold text-white transition-transform hover:-translate-y-0.5 sm:flex sm:px-4 sm:text-[13px]"
              style={PRIMARY}
            >
              <span className={`hidden h-2 w-2 rounded-full sm:inline-block ${m.registered ? "bg-[#7CF2B4]" : "bg-[#F5C451]"}`} />
              {shortAddress(m.address!)}
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open && <AccountPanel m={m} onClose={() => setOpen(false)} />}
          </div>
        ) : (
          m.phase === "idle" && (
            <button
              type="button"
              onClick={onConnect}
              onMouseEnter={onWake}
              onFocus={onWake}
              className="btn-spring whitespace-nowrap rounded-[18px] px-4 py-3 font-round text-[14px] font-semibold text-white sm:px-5"
              style={PRIMARY}
            >
              Connect wallet
            </button>
          )
        )}
      </div>
    </header>
  );
}
