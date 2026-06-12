"use client";

import Reveal from "./Reveal";
import { useEffect, useRef } from "react";

const FEATURES = [
  {
    number: "01",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="24" cy="24" r="3" fill="currentColor" />
        <path d="M24 12 L24 8M24 40 L24 36M12 24 L8 24M40 24 L36 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
        <path d="M17 17 L21 21M31 31 L27 27M31 17 L27 21M17 31 L21 27" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.5"/>
      </svg>
    ),
    label: "Privacy",
    title: "Zero-Knowledge at the core",
    description: "Every transfer is shielded by a Groth16 ZK proof. No one — not your node, your ISP, nor Menoid itself — can see your balance, recipient, or amount.",
    stat: "100%",
    statLabel: "On-device proofs",
    accentDark: "#A36E14",
    accentMid: "#C8920E",
    accentLight: "rgba(232,174,58,0.14)",
    border: "rgba(200,146,14,0.28)",
  },
  {
    number: "02",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        <rect x="8" y="14" width="32" height="22" rx="4" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
        <path d="M16 24 Q20 18 24 24 Q28 30 32 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="16" cy="24" r="2" fill="currentColor" fillOpacity="0.7"/>
        <circle cx="32" cy="24" r="2" fill="currentColor" fillOpacity="0.7"/>
        <path d="M14 10 L14 6M24 10 L24 6M34 10 L34 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35"/>
      </svg>
    ),
    label: "Intelligence",
    title: "AI that routes your gas",
    description: "Our on-chain AI agent scans every supported chain in real time and picks the cheapest path before you even blink. No manual bridging. No wasted gas.",
    stat: "Auto",
    statLabel: "Gas optimization",
    accentDark: "#171311",
    accentMid: "#4a3828",
    accentLight: "rgba(23,19,17,0.07)",
    border: "rgba(23,19,17,0.14)",
  },
  {
    number: "03",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        <path d="M24 6 L38 13 L38 28 C38 36 31 41 24 44 C17 41 10 36 10 28 L10 13 Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
        <path d="M17 24 L22 29 L31 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="14" r="2" fill="currentColor" fillOpacity="0.45"/>
      </svg>
    ),
    label: "Custody",
    title: "Your keys, your kingdom",
    description: "Fully non-custodial from day one. Keys are generated locally and never leave your device. Menoid cannot access, freeze, or move your funds — ever.",
    stat: "0",
    statLabel: "Keys ever seen",
    accentDark: "#14532d",
    accentMid: "#16a34a",
    accentLight: "rgba(22,163,74,0.09)",
    border: "rgba(22,163,74,0.22)",
  },
  {
    number: "04",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 3"/>
        <circle cx="24" cy="12" r="3" fill="currentColor" fillOpacity="0.7"/>
        <circle cx="33" cy="30" r="3" fill="currentColor" fillOpacity="0.7"/>
        <circle cx="15" cy="30" r="3" fill="currentColor" fillOpacity="0.7"/>
        <path d="M24 15 L32 28M24 15 L16 28M16 30 L32 30" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" strokeLinecap="round"/>
      </svg>
    ),
    label: "Interop",
    title: "Multi-chain, one pool",
    description: "Shield assets from Ethereum, Arbitrum, Base, and more — all into a single Monad-native privacy pool. One interface. Universal coverage.",
    stat: "4+",
    statLabel: "Chains supported",
    accentDark: "#3730a3",
    accentMid: "#6366f1",
    accentLight: "rgba(99,102,241,0.09)",
    border: "rgba(99,102,241,0.22)",
  },
  {
    number: "05",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        <path d="M8 32 C14 20, 22 28, 24 16 C26 4, 32 18, 40 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.4"/>
        <path d="M8 36 C14 24, 22 32, 24 20 C26 8, 32 22, 40 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" strokeOpacity="0.22"/>
        <circle cx="8" cy="36" r="2.5" fill="currentColor" fillOpacity="0.5"/>
        <circle cx="24" cy="20" r="2.5" fill="currentColor" fillOpacity="0.9"/>
        <circle cx="40" cy="18" r="2.5" fill="currentColor" fillOpacity="0.5"/>
      </svg>
    ),
    label: "Speed",
    title: "10,000+ TPS on Monad",
    description: "Privacy shouldn't cost you speed. Menoid runs natively on Monad's parallel-EVM — ZK privacy at a throughput no other chain can match.",
    stat: "10k+",
    statLabel: "Transactions/sec",
    accentDark: "#1e40af",
    accentMid: "#3b82f6",
    accentLight: "rgba(59,130,246,0.09)",
    border: "rgba(59,130,246,0.22)",
  },
  {
    number: "06",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10">
        <ellipse cx="24" cy="30" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.28"/>
        <path d="M10 30 L10 22 C10 18.7 16.3 16 24 16 C31.7 16 38 18.7 38 22 L38 30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.28"/>
        <path d="M10 22 C10 25.3 16.3 28 24 28 C31.7 28 38 25.3 38 22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.28"/>
        <circle cx="24" cy="22" r="2.5" fill="currentColor" fillOpacity="0.7"/>
      </svg>
    ),
    label: "Tech",
    title: "Stealth addresses, always",
    description: "Every outgoing transfer mints a fresh one-time stealth address via ECDH. Your on-chain footprint is shredded, transaction by transaction.",
    stat: "ECIES",
    statLabel: "Note encryption",
    accentDark: "#7c2d12",
    accentMid: "#ea580c",
    accentLight: "rgba(234,88,12,0.09)",
    border: "rgba(234,88,12,0.22)",
  },
];

function FeatureCard({ f, index }: { f: (typeof FEATURES)[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    card.addEventListener("mousemove", onMove);
    return () => card.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Reveal delay={index * 75} variant="scale">
      <div
        ref={cardRef}
        className="group relative h-full overflow-hidden rounded-3xl p-7 cursor-default transition-all duration-500 hover:-translate-y-1"
        style={{
          background: `rgba(255,255,255,0.42)`,
          border: `1px solid ${f.border}`,
          boxShadow: "0 1px 0 rgba(255,255,255,0.85) inset, var(--shadow-sm)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(260px circle at var(--mx,50%) var(--my,0%), ${f.accentLight} 0%, transparent 70%)`,
          }}
        />

        {/* Label + number */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: f.accentMid }}>
            {f.label}
          </span>
          <span className="font-mono text-[11px] font-black" style={{ color: f.accentDark, opacity: 0.18 }}>
            {f.number}
          </span>
        </div>

        {/* Icon box */}
        <div
          className="mb-5 inline-flex items-center justify-center rounded-2xl p-3"
          style={{
            background: `rgba(255,255,255,0.55)`,
            border: `1px solid ${f.border}`,
            color: f.accentDark,
            boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          {f.icon}
        </div>

        {/* Title */}
        <h3 className="font-display text-[21px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--ink)] mb-3">
          {f.title}
        </h3>

        {/* Description */}
        <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)] mb-7">
          {f.description}
        </p>

        {/* Stat chip */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: `1px solid ${f.border}`,
            boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          <span className="font-mono text-[13px] font-black" style={{ color: f.accentDark }}>{f.stat}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: f.accentMid }}>{f.statLabel}</span>
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${f.accentMid}, transparent)` }}
        />
      </div>
    </Reveal>
  );
}

export default function Features() {
  return (
    <section id="features" className="grain relative overflow-hidden py-28 px-4 sm:px-6">
      {/* Section orb */}
      <div className="orb orb-3 absolute"
        style={{ top: "10%", right: "-10%", width: "min(60vw,360px)", height: "min(60vw,360px)", opacity: 0.7 }} />

      {/* Sheen */}
      <div className="sheen" />

      {/* Divider */}
      <div
        className="relative z-10 mx-auto mb-20 max-w-6xl h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(163,110,20,0.2) 30%, rgba(163,110,20,0.2) 70%, transparent)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <Reveal className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-[var(--gold)] mb-4">
                ✦ Why Menoid ✦
              </p>
              <h2
                className="font-display font-black tracking-[-0.035em] text-[var(--ink)] leading-[1.05]"
                style={{ fontSize: "clamp(34px, 5vw, 64px)" }}
              >
                Every feature{" "}
                <em className="font-display font-light italic" style={{ color: "var(--gold-deep)" }}>
                  earns its place.
                </em>
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)] lg:text-right">
              No bloat. No compromise. Menoid ships only what makes privacy
              faster, safer, and invisible.
            </p>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.number} f={f} index={i} />
          ))}
        </div>

        {/* Tech footnote */}
        <Reveal delay={120} className="mt-10">
          <div
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl px-6 py-4"
            style={{
              background: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(163,110,20,0.16)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-xs)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">
              Powered by
            </span>
            {[
              { name: "Groth16", sub: "ZK Proofs" },
              { name: "Poseidon", sub: "Hash" },
              { name: "ECIES", sub: "Encryption" },
              { name: "Monad", sub: "L1 Chain" },
              { name: "snarkjs", sub: "Proof Engine" },
            ].map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
                <span className="font-mono text-[12px] font-semibold text-[var(--ink)]">{t.name}</span>
                <span className="font-mono text-[10px] text-[var(--muted)]">/ {t.sub}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
