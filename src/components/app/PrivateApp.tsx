"use client";

import Link from "next/link";
import { useMemo } from "react";

import AppSky from "./AppSky";
import Mascot from "./Mascot";
import CloudVoyage from "./CloudVoyage";
import RollingNumber from "./RollingNumber";
import MenoidWordmark from "../MenoidWordmark";
import { useMenoid } from "./useMenoid";
import { formatAmount, formatUsd, usdOf } from "@/lib/v1m/format";
import { shortAddress, explorerTx } from "@/lib/v1m/wallet";

/* ────────────────────────────────────────────────────────────
   /app — Menoid's private mode on the web (v1-mainnet, Monad
   testnet). Connect → sign once → your private balance.
   The Mask / Send / Swap / Unmask panels plug into useMenoid's
   actions (next step).
   ──────────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(252,246,255,0.8) 100%)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 40px 80px -36px rgba(64,36,122,0.55), 0 10px 30px -12px rgba(78,47,142,0.25), inset 0 1px 0 rgba(255,255,255,0.9)",
  backdropFilter: "blur(18px) saturate(140%)",
  borderRadius: 30,
};
const primary: React.CSSProperties = {
  background: "linear-gradient(135deg, #9C7CE0 0%, #6D4BC4 55%, #4E2F8E 100%)",
  boxShadow: "0 14px 30px -12px rgba(78,47,142,0.7)",
};

export default function PrivateApp() {
  const m = useMenoid();

  const totalUsd = useMemo(() => {
    if (!m.view || !m.config) return 0;
    return m.config.tokens.reduce((sum, t) => sum + usdOf(m.view!.balances[t.address] ?? 0n, t.decimals, m.prices[t.address]), 0);
  }, [m.view, m.config, m.prices]);

  const mood = m.phase === "idle" ? "sleeping" : m.phase === "ready" ? "idle" : m.phase === "unregistered" ? "awake" : "waiting";

  return (
    <div className="relative min-h-svh text-[#2E1A5C]">
      <AppSky />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-6">
        <Link href="/" className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 shadow-sm">
          <Mascot className="h-8 w-8" />
          <MenoidWordmark tone="violet" className="h-[15px] w-auto" />
        </Link>
        <span className="hidden rounded-full bg-white/50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#4E2F8E] sm:inline">
          Private mode · {m.config?.name ?? "Monad Testnet"}
        </span>
        <div className="flex items-center gap-2">
          {m.phase === "ready" && (
            <div className="rounded-2xl bg-white/85 px-4 py-1.5 text-right shadow-sm">
              <p className="font-round text-[17px] font-semibold leading-tight">
                <RollingNumber value={formatUsd(totalUsd)} height={22} />
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#2E1A5C]/55">Private</p>
            </div>
          )}
          {m.address ? (
            <button onClick={m.disconnect} className="rounded-2xl px-4 py-2.5 font-mono text-[13px] font-semibold text-white" style={primary} title="Disconnect">
              {shortAddress(m.address)}
            </button>
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-[560px] flex-col items-center px-4 pb-48 pt-10">
        {m.wrongChain && (
          <button onClick={m.switchChain} className="mb-4 w-full rounded-2xl bg-amber-100/90 px-4 py-3 text-[13px] font-semibold text-amber-800">
            Your wallet left Monad Testnet — tap to switch back
          </button>
        )}

        <section className="w-full p-6 sm:p-8" style={{ ...card, animation: "hero-rise 820ms var(--ease-out-quart) both" }}>
          {m.phase !== "ready" && (
            <div className="flex flex-col items-center text-center">
              <Mascot mood={mood} className="h-28 w-28" />
              <h1 className="font-round mt-3 text-[26px] font-semibold tracking-[-0.02em]">
                {m.phase === "idle" && "Your crypto. Unseen."}
                {m.phase === "connecting" && "Connecting your wallet…"}
                {m.phase === "signing" && "Unlock your private account"}
                {m.phase === "syncing" && "Syncing your private balance…"}
                {m.phase === "unregistered" && "Open your private account"}
              </h1>
              <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[#2E1A5C]/65">
                {m.phase === "idle" && "Connect your wallet. One signature creates your private keys — nothing to back up, no new seed phrase."}
                {m.phase === "connecting" && "Approve the connection and switch to Monad Testnet."}
                {m.phase === "signing" && "Sign the Menoid message in your wallet. It never leaves this tab and costs no gas."}
                {m.phase === "syncing" && "Decrypting your notes locally. The relayer never learns which ones are yours."}
                {m.phase === "unregistered" && "A one-time registration lets others send to you privately. One more signature, then one transaction."}
              </p>
              {(m.phase === "syncing" || m.phase === "signing" || m.phase === "connecting") && <div className="mt-2 w-full"><CloudVoyage /></div>}
              {m.phase === "idle" && (
                <button onClick={m.connect} className="btn-spring mt-6 w-full rounded-[20px] py-4 font-round text-[16px] font-semibold text-white" style={primary}>
                  Connect wallet
                </button>
              )}
              {m.phase === "unregistered" && (
                <button onClick={m.register} className="btn-spring mt-6 w-full rounded-[20px] py-4 font-round text-[16px] font-semibold text-white" style={primary}>
                  Register
                </button>
              )}
              {m.error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{m.error}</p>}
            </div>
          )}

          {m.phase === "ready" && m.config && (
            <div>
              <p className="font-round text-[10px] font-bold uppercase tracking-[0.45em] text-[#4E2F8E]/60">Hidden treasure</p>
              <p className="font-round mt-2 text-[44px] font-bold leading-none tracking-[-0.03em] text-[#3B2570]">
                <RollingNumber value={formatUsd(totalUsd)} height={48} />
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {m.config.tokens.map((t) => {
                  const priv = m.view?.balances[t.address] ?? 0n;
                  const pub = m.publicBalances[t.address] ?? 0n;
                  return (
                    <div key={t.address} className="flex items-center justify-between rounded-[20px] bg-[rgba(244,236,255,0.8)] px-4 py-3">
                      <div>
                        <p className="font-round text-[15px] font-semibold">{t.symbol}</p>
                        <p className="text-[11px] text-[#2E1A5C]/55">Public: {formatAmount(pub, t.decimals)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-round text-[15px] font-semibold">{formatAmount(priv, t.decimals)}</p>
                        <p className="text-[11px] text-[#2E1A5C]/55">{formatUsd(usdOf(priv, t.decimals, m.prices[t.address]))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-[12px] text-[#2E1A5C]/55">
                {m.view?.activity.length ?? 0} private events · {m.syncing ? "syncing…" : "up to date"}
              </p>
            </div>
          )}
        </section>
      </main>

      {m.tx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(46,26,92,0.28)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-[420px] p-7 text-center" style={card}>
            <Mascot mood={m.tx.status === "success" ? "wink" : m.tx.status === "error" ? "awake" : "waiting"} className="mx-auto h-24 w-24" />
            <h2 className="font-round mt-2 text-[20px] font-semibold">{m.tx.title}</h2>
            <div className="mt-3 flex justify-center gap-1.5">
              {m.tx.steps.map((s, i) => (
                <span key={s} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${i <= m.tx!.step ? "bg-[#6D4BC4] text-white" : "bg-[#6D4BC4]/10 text-[#4E2F8E]/60"}`}>{s}</span>
              ))}
            </div>
            {m.tx.status === "running" && <CloudVoyage />}
            <p className="mt-2 text-[13px] text-[#2E1A5C]/70">{m.tx.status === "error" ? m.tx.error : m.tx.result || m.tx.message}</p>
            {m.tx.txHash && (
              <a href={explorerTx(m.tx.txHash)} target="_blank" rel="noreferrer" className="mt-2 block font-mono text-[11px] text-[#4E2F8E]/70 underline">
                {shortAddress(m.tx.txHash)}
              </a>
            )}
            {m.tx.status !== "running" && (
              <button onClick={m.closeTx} className="btn-spring mt-5 w-full rounded-[18px] py-3 font-round font-semibold text-white" style={primary}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
