"use client";

import { useEffect, useState } from "react";

import { explorerTx, shortAddress } from "@/lib/v1m/wallet";
import Mascot from "./Mascot";
import CloudVoyage from "./CloudVoyage";
import type { TxState } from "./useMenoid";
import { CARD, PRIMARY } from "./ui";

/* ────────────────────────────────────────────────────────────
   The voyage sheet (the extension's mask / send modals, in the
   site's light palette): the mark watches a little cloud drift
   while the proof is forged and the relayer carries it; it winks
   when the treasure lands.
   ──────────────────────────────────────────────────────────── */

const EYEBROW: Record<TxState["kind"], { running: string; success: string }> = {
  register: { running: "Opening your account", success: "Account open" },
  mask: { running: "Hiding in the clouds", success: "Veil drawn" },
  send: { running: "Sailing the veil", success: "Treasure delivered" },
  swap: { running: "Trading in the dark", success: "Swap complete" },
  unmask: { running: "Back to the open", success: "Revealed" },
  faucet: { running: "Testnet faucet", success: "Minted" },
};

const FLAVOR: Record<TxState["kind"], string[]> = {
  register: ["Carving your secret door…", "Writing your name in the clouds…", "Your keys never leave this tab…"],
  mask: ["The veil stirs…", "Coins drift into the clouds…", "No trace shall remain…"],
  send: ["Forging the zero-knowledge seal…", "The ship crosses the veil…", "No one shall trace this voyage…"],
  swap: ["Charting the secret route…", "The pool trades in your stead…", "The cryptographic tide rises…"],
  unmask: ["Forging the zero-knowledge seal…", "Lifting the veil…", "Back to the open sea…"],
  faucet: ["Minting test doubloons…"],
};

function Flavor({ kind }: { kind: TxState["kind"] }) {
  const lines = FLAVOR[kind];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % lines.length), 2800);
    return () => clearInterval(t);
  }, [lines.length]);
  return (
    <p key={i} className="font-display mt-1 text-[13px] italic text-[#4E2F8E]/55" style={{ animation: "app-fade 600ms ease both" }}>
      “{lines[i]}”
    </p>
  );
}

export default function TxOverlay({ tx, onClose }: { tx: TxState; onClose: () => void }) {
  const running = tx.status === "running";
  const success = tx.status === "success";
  const failed = tx.status === "error";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center px-3 pb-3 sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-label={tx.title}>
      <div className="absolute inset-0 bg-[rgba(46,26,92,0.32)] backdrop-blur-[6px]" style={{ animation: "app-fade 300ms ease both" }} onClick={() => !running && onClose()} />
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] px-7 pb-6 pt-7 text-center" style={{ ...CARD, animation: "app-rise 520ms cubic-bezier(0.22,1,0.36,1) both" }}>
        {/* soft orbs, like the extension's treasure card */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(159,125,249,0.35) 0%, transparent 62%)", filter: "blur(30px)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,190,232,0.4) 0%, transparent 62%)", filter: "blur(36px)" }} />

        <p className="relative font-mono text-[10px] uppercase tracking-[0.42em] text-[#7556CF]">
          {failed ? "Storm rolled in" : success ? EYEBROW[tx.kind].success : EYEBROW[tx.kind].running}
        </p>
        <h2 className="font-round relative mt-1.5 text-[22px] font-semibold tracking-[-0.02em] text-[#2E1A5C]">{tx.title}</h2>

        <Mascot mood={success ? "wink" : failed ? "awake" : "waiting"} className="relative mx-auto mt-3 h-[104px] w-[104px]" />

        {/* steps */}
        <div className="relative mx-auto mt-4 flex max-w-[320px] items-center">
          {tx.steps.map((s, i) => {
            const done = success || i < tx.step;
            const current = running && i === tx.step;
            return (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-500"
                    style={
                      done
                        ? { background: "#6D4BC4", color: "#fff" }
                        : current
                          ? { background: "#fff", color: "#6D4BC4", boxShadow: "0 0 0 2px #6D4BC4, 0 0 0 6px rgba(109,75,196,0.15)" }
                          : failed && i === tx.step
                            ? { background: "#E14869", color: "#fff" }
                            : { background: "rgba(109,75,196,0.12)", color: "rgba(78,47,142,0.5)" }
                    }
                  >
                    {done ? "✓" : failed && i === tx.step ? "!" : i + 1}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4E2F8E]/60">{s}</span>
                </div>
                {i < tx.steps.length - 1 && (
                  <span className="mx-1 mb-5 h-[2px] flex-1 rounded-full" style={{ background: done ? "#6D4BC4" : "rgba(109,75,196,0.15)", transition: "background 500ms" }} />
                )}
              </div>
            );
          })}
        </div>

        {running && (
          <div className="relative mt-1">
            <CloudVoyage />
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6D4BC4]">{tx.message}</p>
            <Flavor kind={tx.kind} />
            <p className="mt-3 text-[11px] text-[#2E1A5C]/45">Proofs are made in this browser. Keep this tab open.</p>
          </div>
        )}

        {success && (
          <div className="relative mt-5 rounded-[20px] px-4 py-3 text-left" style={{ background: "rgba(34,160,107,0.09)", border: "1px solid rgba(34,160,107,0.22)" }}>
            <p className="text-[14px] font-semibold text-[#16794F]">{tx.result ?? tx.message}</p>
            {tx.txHash && (
              <a href={explorerTx(tx.txHash)} target="_blank" rel="noreferrer" className="mt-1 inline-block font-mono text-[11px] text-[#2E1A5C]/55 underline decoration-dotted underline-offset-4">
                tx {shortAddress(tx.txHash)} ↗
              </a>
            )}
          </div>
        )}

        {failed && (
          <div className="relative mt-5 rounded-[20px] px-4 py-3 text-left" style={{ background: "rgba(225,72,105,0.08)", border: "1px solid rgba(225,72,105,0.22)" }}>
            <p className="text-[13.5px] leading-relaxed text-[#9F2240]">{tx.error}</p>
          </div>
        )}

        {!running && (
          <button type="button" onClick={onClose} className="btn-spring relative mt-5 w-full rounded-[20px] py-3.5 font-round text-[16px] font-semibold text-white" style={PRIMARY}>
            {success ? "Done" : "Close"}
          </button>
        )}
      </div>
    </div>
  );
}
