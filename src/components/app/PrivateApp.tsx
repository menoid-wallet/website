"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import AppSky from "./AppSky";
import AppHeader from "./AppHeader";
import Mascot from "./Mascot";
import CloudVoyage from "./CloudVoyage";
import MaskPanel from "./MaskPanel";
import SendPanel from "./SendPanel";
import SwapPanel from "./SwapPanel";
import UnmaskPanel from "./UnmaskPanel";
import TxOverlay from "./TxOverlay";
import WalletPicker from "./WalletPicker";
import { useMenoid } from "./useMenoid";
import { CARD, ConnectContext } from "./ui";

/* ────────────────────────────────────────────────────────────
   /app — Menoid's private mode on the web (v1-mainnet).
   Mask · Send · Swap · Unmask are on show from the start; the
   panel's button walks you through it: Connect wallet → sign once
   (keys are derived in this tab) → Register (new accounts only) →
   the action itself.
   ──────────────────────────────────────────────────────────── */

type Tab = "mask" | "send" | "swap" | "unmask";
const TABS: { id: Tab; label: string }[] = [
  { id: "mask", label: "Mask" },
  { id: "send", label: "Send" },
  { id: "swap", label: "Swap" },
  { id: "unmask", label: "Unmask" },
];

function Tabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const index = TABS.findIndex((t) => t.id === value);
  return (
    <div className="relative grid grid-cols-4 rounded-[24px] p-1.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }} role="tablist">
      <span
        className="absolute bottom-1.5 left-1.5 top-1.5 rounded-[19px] bg-white shadow-[0_8px_20px_-10px_rgba(46,26,92,0.45)]"
        style={{ width: "calc((100% - 12px) / 4)", transform: `translateX(${index * 100}%)`, transition: "transform 460ms cubic-bezier(0.34,1.3,0.5,1)" }}
        aria-hidden
      />
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className="relative z-10 rounded-[19px] py-3 font-round text-[16px] font-semibold transition-colors duration-300"
          style={{ color: value === t.id ? "#2E1A5C" : "rgba(46,26,92,0.5)" }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function PrivateApp() {
  const m = useMenoid();
  const [tab, setTab] = useState<Tab>("mask");
  const [picking, setPicking] = useState(false);
  const [awake, setAwake] = useState(false);
  const openPicker = useCallback(() => setPicking(true), []);
  const closePicker = useCallback(() => setPicking(false), []);
  const wake = useCallback(() => setAwake(true), []);
  const connect = useMemo(() => ({ open: openPicker, wake }), [openPicker, wake]);

  // the mark in the header sleeps until the cursor first touches a Connect
  // button, then stays awake
  const asleep = m.phase === "idle" && !awake;

  return (
    <ConnectContext.Provider value={connect}>
      <div className="relative flex min-h-svh flex-1 flex-col text-[#2E1A5C]">
        <AppSky />
        <AppHeader m={m} asleep={asleep} onConnect={openPicker} onWake={wake} />

        <main className="relative z-10 mx-auto w-full max-w-[540px] flex-1 px-4 pb-44 pt-8 sm:pt-12">
          {m.wrongChain && (
            <button type="button" onClick={m.switchChain} className="mb-4 w-full rounded-[18px] bg-amber-50/95 px-4 py-3 text-[13px] font-semibold text-amber-800 shadow-sm">
              Your wallet left Monad Testnet — tap to switch back
            </button>
          )}

          {m.config ? (
            <>
              <Tabs value={tab} onChange={setTab} />
              <section key={tab} className="mt-3 rounded-[30px] p-2.5 sm:p-3" style={{ ...CARD, animation: "app-rise 520ms cubic-bezier(0.22,1,0.36,1) both" }}>
                {tab === "mask" && <MaskPanel m={m} />}
                {tab === "send" && <SendPanel m={m} />}
                {tab === "swap" && <SwapPanel m={m} />}
                {tab === "unmask" && <UnmaskPanel m={m} />}
              </section>
            </>
          ) : (
            <section className="w-full rounded-[32px] px-6 pb-7 pt-8 text-center" style={{ ...CARD, animation: "app-rise 700ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <Mascot mood="waiting" className="mx-auto h-24 w-24" />
              <p className="font-round mt-3 text-[20px] font-semibold text-[#2E1A5C]">Reaching the relayer…</p>
              <CloudVoyage />
            </section>
          )}

          {m.error && (
            <p className="mt-3 rounded-[18px] bg-rose-50/95 px-4 py-3 text-[13px] text-rose-700" role="alert">
              {m.error}{" "}
              <button type="button" className="font-semibold underline" onClick={() => m.setError(null)}>
                Dismiss
              </button>
            </p>
          )}
        </main>

        <footer className="relative z-10 pb-6 text-center text-[11px] font-medium text-[#4E2F8E]/70">
          Menoid v1 · Monad Testnet · test tokens only ·{" "}
          <Link href="/" className="underline decoration-dotted underline-offset-4">
            menoid.xyz
          </Link>
        </footer>

        {m.tx && <TxOverlay tx={m.tx} onClose={m.closeTx} />}
        <WalletPicker
          open={picking}
          onClose={closePicker}
          onPick={(wallet) => {
            setPicking(false);
            void m.connect(wallet);
          }}
        />

        <style>{`
          @keyframes app-pop { 0% { opacity: 0; transform: scale(0.92) translateY(-6px); } 100% { opacity: 1; transform: none; } }
          @keyframes app-fade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes app-rise { 0% { opacity: 0; transform: translateY(26px) scale(0.985); } 100% { opacity: 1; transform: none; } }
          .app-logo-asleep .logo-eye-left, .app-logo-asleep .logo-eye-right { animation: none; transform: scaleY(0.1); }
          .app-scroll { scrollbar-width: thin; scrollbar-color: rgba(117,86,207,0.35) transparent; }
          .app-scroll::-webkit-scrollbar { width: 6px; }
          .app-scroll::-webkit-scrollbar-thumb { background: rgba(117,86,207,0.35); border-radius: 999px; }
        `}</style>
      </div>
    </ConnectContext.Provider>
  );
}
