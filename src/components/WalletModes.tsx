"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "./Reveal";

const MODES = [
  {
    id: "open",
    label: "Open Mode",
    tag: "Normal · EOA",
    src: "/wallet/openMOde.png",
    alt: "Menoid Open Mode",
    accentColor: "#A36E14",
    title: "A clean account for everyday MON.",
    description: "Receive, send, and explore Monad with self-custody. Keys live on your device — Menoid never touches them. Use it like any regular wallet, with the escape hatch to go dark whenever you need.",
    bullets: ["Standard EOA wallet", "Send · Receive · Swap", "Full Monad ecosystem access", "Zero custody risk"],
  },
  {
    id: "noid",
    label: "Noid Mode",
    tag: "Private · ZK",
    src: "/wallet/NoidMode.png",
    alt: "Menoid Noid Mode",
    accentColor: "#C8920E",
    title: "A ZK account in the shadow waters.",
    description: "Funds live as Poseidon commitments inside a Groth16 pool. Proofs are generated on your device — never on a server. Move value between stealth addresses without leaving a single trace.",
    bullets: ["ZK shielded balance", "Stealth address transfers", "Local proof generation", "ECIES encrypted notes"],
  },
];

export default function WalletModes() {
  const [active, setActive] = useState<"open" | "noid">("open");
  const mode = MODES.find((m) => m.id === active)!;

  const isNoid = active === "noid";

  return (
    <section
      id="wallet-modes"
      className="grain relative overflow-hidden py-28 px-4 sm:px-6 transition-all duration-700 ease-in-out"
      style={{
        background: isNoid
          ? "linear-gradient(160deg, #3C2C1E 0%, #241A12 50%, #150F0B 100%)"
          : "linear-gradient(160deg, #F4E7CC 0%, #FBF1D9 50%, #EAD5A7 100%)",
      }}
    >
      {/* Orbs */}
      <div className="orb orb-2 absolute"
        style={{
          bottom: "-12%",
          right: "-10%",
          width: "min(70vw,400px)",
          height: "min(70vw,400px)",
          opacity: isNoid ? 0.35 : 0.7,
          mixBlendMode: isNoid ? "screen" : "normal",
        }} />
      <div className="orb orb-1 absolute"
        style={{
          top: "5%",
          left: "-10%",
          width: "min(50vw,280px)",
          height: "min(50vw,280px)",
          opacity: isNoid ? 0.25 : 0.5,
          mixBlendMode: isNoid ? "screen" : "normal",
        }} />

      {/* Sheen */}
      <div className="sheen" style={{ opacity: isNoid ? 0.15 : 0.4 }} />

      {/* Divider */}
      <div
        className="relative z-10 mx-auto mb-20 max-w-6xl h-px"
        style={{
          background: isNoid
            ? "linear-gradient(90deg, transparent, rgba(200,146,14,0.3) 30%, rgba(200,146,14,0.3) 70%, transparent)"
            : "linear-gradient(90deg, transparent, rgba(163,110,20,0.2) 30%, rgba(163,110,20,0.2) 70%, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <Reveal className="text-center mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)] mb-3">
            ✦ Two Modes, One Wallet ✦
          </p>
          <h2
            className={`font-display font-black tracking-[-0.035em] transition-colors duration-500 ${
              isNoid ? "text-[#FBF1D9]" : "text-[var(--ink)]"
            }`}
            style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}
          >
            Sail open, or sail in the{" "}
            <em
              className="font-display font-light italic transition-colors duration-500"
              style={{ color: isNoid ? "#E8AE3A" : "var(--gold-deep)" }}
            >
              shadow waters.
            </em>
          </h2>
          <p className={`mt-4 max-w-lg mx-auto text-[15px] leading-relaxed transition-colors duration-500 ${
            isNoid ? "text-[#C9BBAA]" : "text-[var(--ink-soft)]"
          }`}>
            Menoid holds two accounts at once. Flip between them with a single tap —
            your public face for the world, your invisible self for the deep.
          </p>
        </Reveal>

        {/* Mode tabs */}
        <Reveal delay={80} className="flex justify-center mb-10">
          <div
            className="inline-flex gap-1 rounded-2xl p-1 transition-all duration-500"
            style={{
              background: isNoid ? "rgba(23,19,17,0.6)" : "rgba(255,255,255,0.45)",
              border: isNoid ? "1px solid rgba(200,146,14,0.25)" : "1px solid rgba(163,110,20,0.2)",
              boxShadow: isNoid
                ? "0 1px 0 rgba(255,255,255,0.05) inset, var(--shadow-xs)"
                : "0 1px 0 rgba(255,255,255,0.85) inset, var(--shadow-xs)",
              backdropFilter: "blur(12px)",
            }}
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                id={`mode-tab-${m.id}`}
                onClick={() => setActive(m.id as "open" | "noid")}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer"
                style={
                  active === m.id
                    ? {
                        background: isNoid ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.85)",
                        color: isNoid ? "#FBF1D9" : "var(--ink)",
                        boxShadow: isNoid
                          ? "0 1px 0 rgba(255,255,255,0.08) inset, var(--shadow-sm)"
                          : "0 1px 0 rgba(255,255,255,1) inset, var(--shadow-sm)",
                      }
                    : { color: isNoid ? "rgba(251,241,217,0.55)" : "var(--ink-soft)" }
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Content */}
        <Reveal key={active} variant="scale" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 transition-all duration-500"
              style={{
                background: isNoid ? "rgba(23,19,17,0.4)" : "rgba(255,255,255,0.55)",
                border: isNoid ? `1px solid rgba(200,146,14,0.35)` : `1px solid rgba(163,110,20,0.25)`,
                boxShadow: isNoid ? "none" : "0 1px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ background: mode.accentColor }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: isNoid ? "#E8AE3A" : mode.accentColor }}>
                {mode.tag}
              </span>
            </div>

            <h3
              className={`font-display font-bold leading-[1.1] tracking-[-0.025em] mb-4 transition-colors duration-500 ${
                isNoid ? "text-[#FBF1D9]" : "text-[var(--ink)]"
              }`}
              style={{ fontSize: "clamp(22px, 3.5vw, 38px)" }}
            >
              {mode.title}
            </h3>

            <p className={`text-[15px] leading-relaxed mb-7 transition-colors duration-500 ${
              isNoid ? "text-[#C9BBAA]" : "text-[var(--ink-soft)]"
            }`}>
              {mode.description}
            </p>

            <ul className="space-y-3">
              {mode.bullets.map((b) => (
                <li key={b} className={`flex items-center gap-3 text-[14px] transition-colors duration-500 ${
                  isNoid ? "text-[#EAD5A7]" : "text-[var(--ink)]"
                }`}>
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-500"
                    style={{
                      background: isNoid ? "rgba(23,19,17,0.5)" : "rgba(255,255,255,0.7)",
                      border: isNoid ? `1px solid rgba(200,146,14,0.3)` : `1px solid rgba(163,110,20,0.2)`,
                      color: isNoid ? "#E8AE3A" : mode.accentColor,
                      boxShadow: isNoid ? "none" : "0 1px 0 rgba(255,255,255,1) inset",
                    }}
                  >
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Screenshot */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div
              className="relative w-full max-w-[260px] sm:max-w-[300px]"
              style={{ filter: isNoid ? "drop-shadow(0 28px 56px rgba(0,0,0,0.45))" : "drop-shadow(0 28px 56px rgba(23,19,17,0.18))" }}
            >
              <div
                className="overflow-hidden rounded-[34px] transition-all duration-500"
                style={{
                  border: isNoid ? "1px solid rgba(200,146,14,0.28)" : "1px solid rgba(163,110,20,0.22)",
                  boxShadow: isNoid
                    ? "0 1px 0 rgba(255,255,255,0.1) inset"
                    : "0 1px 0 rgba(255,255,255,0.7) inset",
                }}
              >
                <Image src={mode.src} alt={mode.alt} width={480} height={760} className="w-full h-auto" priority />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
