"use client";

import Reveal from "./Reveal";

interface Bullet {
  icon: string;
  text: string;
}
interface Phase {
  version: string;
  label: string;
  tagline: string;
  bullets: Bullet[];
  cohorts: string[];
  locked?: boolean;
}

const PHASES: Phase[] = [
  {
    version: "V1",
    label: "Current Release",
    tagline: "Private Beta · Live Now",
    bullets: [
      { icon: "🌐", text: "6 testnets — Monad, Sepolia, Base, Solana, Sui & Aptos." },
      { icon: "🤖", text: "Minimalistic Meno — Meno Chat + Co-Pilot mode for a single dApp." },
      { icon: "🎯", text: "Target: 1,000 crypto user reviews." },
      { icon: "🎁", text: "Rewards distributed to the 1,000 reviewers after the stable launch." },
    ],
    cohorts: [
      "V1 Private Beta (Extension)",
      "V1 Open Beta (Extension)",
      "V1 Mobile Beta (iOS & Android)",
    ],
  },
  {
    version: "V2",
    label: "Sealed Orders",
    tagline: "Classified",
    locked: true,
    bullets: [
      { icon: "⛓️", text: "20+ mainnet networks, shielded end to end." },
      { icon: "🧠", text: "Multi-dApp AutoPilot running across tabs at once." },
      { icon: "🔐", text: "Shielded pool v2 with instant client-side proofs." },
      { icon: "🤝", text: "Private cross-chain bridges with hidden routing." },
    ],
    cohorts: ["████████ ███████", "████ █████████", "███████ ████"],
  },
  {
    version: "V3",
    label: "Sealed Orders",
    tagline: "Classified",
    locked: true,
    bullets: [
      { icon: "🌍", text: "Universal chain abstraction — one balance, every chain." },
      { icon: "🪄", text: "Autonomous on-chain agents executing your strategies." },
      { icon: "🏦", text: "Institutional-grade private treasury suite." },
      { icon: "🛡️", text: "Zero-knowledge identity & reputation layer." },
    ],
    cohorts: ["███████ █████", "█████████ ██", "████ ███████"],
  },
];

const Lock = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function RoadmapCard({ phase }: { phase: Phase }) {
  const current = !phase.locked;
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[24px] p-6 md:p-7"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)",
        border: current ? "1px solid rgba(200,146,14,0.55)" : "1px solid rgba(163,110,20,0.28)",
        boxShadow: current
          ? "0 0 0 1px rgba(200,146,14,0.3), 0 20px 56px rgba(200,146,14,0.28), 0 10px 28px rgba(0,0,0,0.28)"
          : "0 16px 44px rgba(0,0,0,0.30), 0 1px 0 rgba(255,255,255,0.9) inset",
      }}
    >
      {/* parchment grid overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.30] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "22px 22px, 22px 22px",
        }}
      />

      {/* header */}
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[44px] font-black leading-none text-[var(--ink)]">
            {phase.version}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold-deep)]">
            {phase.label}
          </span>
        </div>

        {current ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ background: "var(--ink)", color: "#FBF1D9" }}
          >
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--gold-bright)]" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">
              You are here
            </span>
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[var(--ink-soft)]"
            style={{ background: "rgba(23,19,17,0.06)", border: "1px solid rgba(163,110,20,0.28)" }}
          >
            <Lock size={11} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]">Sealed</span>
          </span>
        )}
      </div>

      <p className="relative z-10 mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
        {phase.tagline}
      </p>

      {/* body (blurred when locked) */}
      <div className="relative z-10 flex-1">
        <div
          className={phase.locked ? "pointer-events-none select-none" : ""}
          style={phase.locked ? { filter: "blur(6px)", opacity: 0.6 } : undefined}
        >
          <ul className="space-y-3">
            {phase.bullets.map((b) => (
              <li
                key={b.text}
                className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]"
              >
                <span className="mt-[1px] shrink-0 text-[15px] leading-none">{b.icon}</span>
                <span className="font-light">{b.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(163,110,20,0.2)" }}>
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
              Rollout Cohorts
            </p>
            <ul className="space-y-2">
              {phase.cohorts.map((c, i) => (
                <li key={c} className="flex items-center gap-2.5 text-[12.5px] text-[var(--ink)]">
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(163,110,20,0.14)", color: "var(--gold-deep)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-medium">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* locked overlay */}
        {phase.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-4 text-center">
            <div
              className="grid h-14 w-14 place-items-center rounded-full text-[var(--ink)]"
              style={{ background: "rgba(247,236,208,0.6)", border: "1px solid rgba(163,110,20,0.35)", backdropFilter: "blur(2px)" }}
            >
              <Lock size={24} />
            </div>
            <span className="font-display text-[20px] font-black text-[var(--ink)]">Coming Soon</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--gold-deep)]">
              Charted in shadow
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="grain relative overflow-hidden"
      style={{ background: "#171311" }}
    >
      {/* grid blueprint */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(to right,#FBF1D9 1px,transparent 1px),linear-gradient(to bottom,#FBF1D9 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* glows */}
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          top: "-8%",
          right: "-5%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,174,58,0.18) 0%, transparent 60%)",
          filter: "blur(64px)",
          animation: "roadmapOrb1 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          bottom: "-8%",
          left: "-5%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(163,110,20,0.15) 0%, transparent 60%)",
          filter: "blur(64px)",
          animation: "roadmapOrb2 11s ease-in-out infinite 3s",
        }}
      />
      {/* sheen */}
      <div className="sheen absolute inset-0 pointer-events-none" style={{ opacity: 0.12 }} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-24 md:py-28">
        {/* top divider */}
        <div
          className="mx-auto mb-12 h-px max-w-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(200,146,14,0.25) 30%, rgba(200,146,14,0.25) 70%, transparent)",
          }}
        />

        <Reveal className="mb-14 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)]">
            ✦ The Voyage Ahead ✦
          </p>
          <h2
            className="font-display font-black tracking-[-0.035em] text-[#FBF1D9]"
            style={{ fontSize: "clamp(30px, 4.5vw, 54px)" }}
          >
            Roadmap
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-[#C9BBAA]">
            Three chapters chart the journey. We&apos;re sailing the first —{" "}
            <span className="text-[var(--gold-bright)] font-semibold">V1 is live</span> in private
            beta. The rest stay sealed beneath the waterline.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {PHASES.map((phase) => (
            <RoadmapCard key={phase.version} phase={phase} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes roadmapOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-26px, 22px) scale(1.12); }
        }
        @keyframes roadmapOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(34px, -26px) scale(1.15); }
        }
      `}</style>
    </section>
  );
}
