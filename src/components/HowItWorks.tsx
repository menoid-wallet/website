"use client";

import Reveal from "./Reveal";

const STEPS = [
  {
    number: "01",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
        <path d="M10 16 L14 20 L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="8" r="2" fill="currentColor" fillOpacity="0.6" />
        <circle cx="24" cy="16" r="1.5" fill="currentColor" fillOpacity="0.4" />
      </svg>
    ),
    title: "Mask & Deposit",
    subtitle: "AI-Powered ZK Shielding",
    description:
      "Connect your wallet. Our AI agent analyzes gas routes across chains and converts your public assets into ZK-shielded notes on Monad — in one tap.",
    color: "rgba(212,160,23,0.9)",
    glow: "rgba(212,160,23,0.12)",
  },
  {
    number: "02",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path d="M8 16 C8 10, 24 10, 24 16 C24 22, 8 22, 8 16Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <path d="M6 9 L10 13 M26 9 L22 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        <path d="M6 23 L10 19 M26 23 L22 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    ),
    title: "Private ZK Transfer",
    subtitle: "Stealth Transaction Pool",
    description:
      "Move value between stealth addresses through our encrypted pool. Every transfer is fully untraceable — no on-chain footprint, no metadata leakage.",
    color: "rgba(168,120,8,0.9)",
    glow: "rgba(168,120,8,0.12)",
  },
  {
    number: "03",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-7 w-7">
        <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <path d="M11 16 L14.5 19.5 L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Safe Unmask",
    subtitle: "On-Chain Exit",
    description:
      "Withdraw back to any public address securely. Uses ECIES encrypted notes and ZK batching for the lowest possible fees — and zero compromise.",
    color: "rgba(240,217,139,0.9)",
    glow: "rgba(240,217,139,0.1)",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 px-4 overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 50%, var(--bg) 100%)" }}
    >
      {/* Background accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,160,23,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <Reveal className="text-center mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--gold)] mb-4">
            ✦ How It Works ✦
          </p>
          <h2
            className="font-display font-black tracking-[-0.03em] text-[var(--ink)]"
            style={{ fontSize: "clamp(32px, 4.5vw, 60px)" }}
          >
            Three steps to{" "}
            <em className="font-display font-light italic shimmer-gold">total privacy</em>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-[16px] leading-relaxed text-[var(--ink-soft)]">
            Menoid wraps complex ZK cryptography in a dead-simple flow. Private by default, powerful by design.
          </p>
        </Reveal>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: "linear-gradient(180deg, transparent 0%, rgba(212,160,23,0.15) 20%, rgba(212,160,23,0.15) 80%, transparent 100%)" }}
          />

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 120} variant="scale">
                <div
                  className="card-lift group relative rounded-2xl p-7 cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${step.glow}, transparent 70%)` }}
                  />

                  {/* Step number */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="font-mono text-[42px] font-black leading-none"
                      style={{ color: step.color, opacity: 0.25 }}
                    >
                      {step.number}
                    </span>
                    <div style={{ color: step.color }}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Subtitle */}
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: step.color, opacity: 0.8 }}>
                    {step.subtitle}
                  </p>

                  {/* Title */}
                  <h3 className="font-display text-xl font-bold text-[var(--ink)] mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] leading-relaxed text-[var(--ink-soft)]">
                    {step.description}
                  </p>

                  {/* Bottom gold line that grows on hover */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-px rounded-full transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                      opacity: 0.3,
                    }}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA nudge */}
        <Reveal className="mt-14 text-center">
          <a
            href="#waitlist"
            id="how-it-works-cta"
            className="btn-spring inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[14px] font-semibold text-[#08070a]"
            style={{
              background: "linear-gradient(135deg, var(--gold-deep), var(--gold), var(--gold-soft))",
              boxShadow: "0 0 0 1px rgba(212,160,23,0.4), 0 8px 32px rgba(212,160,23,0.25)",
            }}
          >
            Get Early Access
            <span aria-hidden>→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
