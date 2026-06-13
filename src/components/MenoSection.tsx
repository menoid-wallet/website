"use client";

import Image from "next/image";
import Reveal from "./Reveal";

interface FeatureItem {
  title: string;
  icon: React.ReactNode;
}

const MENO_FEATURES: FeatureItem[] = [
  {
    title: "Chat with Meno",
    icon: (
      <svg className="h-4 w-4 text-[var(--gold-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
  {
    title: "Transaction Simulation",
    icon: (
      <svg className="h-4 w-4 text-[var(--gold-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
  },
  {
    title: "Risk Analysis",
    icon: (
      <svg className="h-4 w-4 text-[var(--gold-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
  },
  {
    title: "Surge & Volume Suggestions",
    icon: (
      <svg className="h-4 w-4 text-[var(--gold-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 6l-9.5 9.5-5-5L1 18"></path>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
  },
  {
    title: "Multi-Chain Discovery",
    icon: (
      <svg className="h-4 w-4 text-[var(--gold-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
  },
];

export default function MenoSection() {
  return (
    <section
      id="meno"
      className="grain relative overflow-hidden py-10 md:py-12"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)",
      }}
    >
      {/* Light Parchment Grid Blueprint */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      {/* Background Glows */}
      <div
        className="absolute z-0 pointer-events-none animate-pulse"
        style={{
          top: "10%",
          left: "-5%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,174,58,0.18) 0%, transparent 60%)",
          filter: "blur(60px)",
          animationDuration: "8s",
        }}
      />
      <div
        className="absolute z-0 pointer-events-none animate-pulse"
        style={{
          bottom: "10%",
          right: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(163,110,20,0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
          animationDuration: "10s",
        }}
      />

      {/* Sheen sweep */}
      <div className="sheen absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }} />

      {/* Top Divider */}
      <div
        className="mx-auto mb-8 max-w-6xl h-px relative z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(163,110,20,0.15) 30%, rgba(163,110,20,0.15) 70%, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Mobile Header (Only visible on mobile screens) */}
        <div className="block lg:hidden text-left mb-8">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold-deep)] mb-3">
              ✦ Meet Meno ✦
            </p>
            <h2
              className="font-display font-black tracking-[-0.035em] text-[var(--ink)]"
              style={{ fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: "1.1" }}
            >
              What if wallets
              <br />
              <em className="font-display font-light italic text-[var(--gold-deep)]">could think?</em>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Meno Picture + Features List */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* bobbing Meno character with soft drop shadow */}
            <Reveal className="w-full max-w-[340px] mb-6">
              <div className="relative h-64 w-64 gentle-bob mx-auto">
                <Image
                  src="/meno/meno_hi_text.png"
                  alt="Meno AI Character"
                  fill
                  sizes="256px"
                  className="object-contain filter drop-shadow-[0_18px_30px_rgba(163,110,20,0.3)]"
                />
              </div>
            </Reveal>

            {/* Features list reformatted as horizontal badges */}
            <div className="w-full flex flex-wrap justify-center gap-3 mt-2">
              {MENO_FEATURES.map((feat, idx) => (
                <Reveal key={feat.title} delay={100 + idx * 50}>
                  <div
                    className="inline-flex items-center gap-2.5 rounded-full border px-4 py-2 hover:scale-[1.03] transition-transform duration-200"
                    style={{
                      background: "rgba(255, 255, 255, 0.65)",
                      borderColor: "rgba(163, 110, 20, 0.18)",
                      boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-xs)",
                    }}
                  >
                    <div className="shrink-0 p-1.5 rounded-full bg-[rgba(163,110,20,0.06)] border border-[rgba(163,110,20,0.08)]">
                      {feat.icon}
                    </div>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--ink)] font-bold">
                      {feat.title}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right Column: Text and Storytelling */}
          <div className="lg:col-span-7 text-left">
            {/* Desktop Header (Only visible on large screens) */}
            <div className="hidden lg:block">
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold-deep)] mb-3">
                  ✦ Meet Meno ✦
                </p>
                <h2
                  className="font-display font-black tracking-[-0.035em] text-[var(--ink)] mb-8"
                  style={{ fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: "1.1" }}
                >
                  What if wallets
                  <br />
                  <em className="font-display font-light italic text-[var(--gold-deep)]">could think?</em>
                </h2>
              </Reveal>
            </div>

            {/* Imagine points */}
            <div className="space-y-4 mb-8">
              {[
                { type: "say", text: 'Imagine saying: "Hey Meno, make my wallet private."' },
                { type: "say", text: 'Imagine saying: "Hey Meno, swap this token privately."' },
                { type: "think", text: "Imagine someone warning you before you make a costly mistake." },
                { type: "think", text: "Imagine someone understanding how you trade and helping you stay one step ahead." },
              ].map((item, idx) => (
                <Reveal key={idx} delay={50 + idx * 50}>
                  <div
                    className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:translate-x-1"
                    style={{
                      background: item.type === "say"
                        ? "rgba(255, 255, 255, 0.65)"
                        : "rgba(255, 255, 255, 0.4)",
                      borderColor: item.type === "say"
                        ? "rgba(163, 110, 20, 0.22)"
                        : "rgba(163, 110, 20, 0.12)",
                      boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-xs)",
                    }}
                  >
                    {item.type === "say" ? (
                      <div className="h-6 w-6 rounded-full bg-[rgba(163,110,20,0.12)] flex items-center justify-center shrink-0">
                        <svg className="h-3.5 w-3.5 text-[var(--gold-deep)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[rgba(163,110,20,0.06)] flex items-center justify-center shrink-0">
                        <svg className="h-3.5 w-3.5 text-[var(--ink-soft)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                    )}
                    <p className={`text-[14.5px] sm:text-[15px] leading-relaxed ${item.type === "say" ? "text-[var(--ink)] font-medium" : "text-[var(--ink-soft)]"}`}>
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Meno Summary Callout */}
            <Reveal delay={250}>
              <div
                className="p-5 rounded-2xl border"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.45) 100%)",
                  borderColor: "rgba(163, 110, 20, 0.22)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)",
                }}
              >
                <p className="text-[15px] sm:text-[16px] leading-relaxed text-[var(--ink)]">
                  That&apos;s <strong className="text-[var(--gold-deep)] font-bold">Meno</strong>. An intelligent crypto companion designed to help you make better decisions onchain. And more.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
