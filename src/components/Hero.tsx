"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CursorParticles from "./CursorParticles";
// import WaitlistForm from "./WaitlistForm"; // re-enable when V1 beta registration opens

export default function Hero() {
  // Hold the hero entrance until the loader has finished, then rise in.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined" && document.body.dataset.revealed === "true") {
      setRevealed(true);
      return;
    }
    const onReveal = () => setRevealed(true);
    window.addEventListener("menoid:revealed", onReveal);
    // Safety net in case the loader was skipped or removed.
    const fallback = window.setTimeout(() => setRevealed(true), 4200);
    return () => {
      window.removeEventListener("menoid:revealed", onReveal);
      window.clearTimeout(fallback);
    };
  }, []);

  // Clean "rise from the bottom" entrance, delayed until `revealed` flips true.
  const rise = (delay: number): React.CSSProperties => ({
    opacity: 0,
    animation: revealed
      ? `hero-rise 820ms var(--ease-out-quart) ${delay}ms forwards`
      : "none",
  });


  return (
    <section id="top" className="grain relative overflow-hidden pt-28 pb-6 md:pb-16 lg:flex lg:min-h-dvh lg:flex-col">
      <CursorParticles zIndexClass="z-[2]" />
      {/* ── Loader-matched orbs ── */}
      <div className="orb orb-1 absolute"
        style={{ top: "-14%", right: "-12%", width: "min(80vw,440px)", height: "min(80vw,440px)" }} />
      <div className="orb orb-2 absolute"
        style={{ bottom: "-10%", left: "-16%", width: "min(86vw,480px)", height: "min(86vw,480px)" }} />

      {/* ── Sheen sweep ── */}
      <div className="sheen" />

      {/* ── Geometric Blueprint / Grid ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />
      
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 pointer-events-none z-0 opacity-[0.05] select-none">
        <svg width="720" height="720" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="compass-slow">
          <circle cx="400" cy="400" r="380" stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="280" stroke="var(--gold)" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="180" stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="16 8" />
          <line x1="400" y1="0" x2="400" y2="800" stroke="var(--gold)" strokeWidth="0.8" />
          <line x1="0" y1="400" x2="800" y2="400" stroke="var(--gold)" strokeWidth="0.8" />
          <path d="M150 150 L650 650 M150 650 L650 150" stroke="var(--gold)" strokeWidth="0.5" strokeDasharray="8 12" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:flex lg:flex-1 lg:items-center">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Left Column (Content) */}
          <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
              style={{
                ...rise(0),
                background: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(163,110,20,0.22)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset, var(--shadow-xs)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] pulse-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
                V1 Early Access
              </span>
            </div>

            {/* AI-Native Label / Eyebrow */}
            <div
              className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.32em] text-[var(--gold-deep)] mb-4 font-semibold"
              style={rise(100)}
            >
              A Private crypto wallet for the Multi-Chain world.
            </div>

            {/* WTTU headline */}
            <h1
              className="font-display font-black tracking-[-0.035em] text-[var(--ink)] leading-[1.05] mx-auto lg:mx-0 max-w-3xl mb-8"
              style={{ fontSize: "clamp(38px, 6.5vw, 72px)", ...rise(200) }}
            >
              Where{" "}
              <span className="font-display font-light italic text-[var(--gold-deep)] shimmer-gold">
                Treasure
              </span>{" "}
              Travels{" "}
              <span className="font-display font-light italic text-[var(--gold-deep)]">
                Unseen
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              className="mx-auto lg:mx-0 mb-10 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-soft)]"
              style={rise(320)}
            >
              Menoid is a Private crypto wallet built for absolute privacy across 15+ chains.
              Shield your assets and transact completely unseen along with hidden swaps, hidden bridges on Monad, Ethereum, Solana, Sui, and more, all in one place. 
            </p>
              {/* Along side privacy, meet{" "}
              <strong className="font-semibold text-[var(--gold-deep)]">Meno</strong> — your onchain co-pilot, guiding every move you make.*/}
            {/* ── Waitlist form ── */}
            <div
              className="mx-auto lg:mx-0 max-w-md w-full"
              style={rise(440)}
            >
              {/* Registration temporarily disabled — re-enable when V1 beta opens:
              <WaitlistForm inputId="hero-email-input" />
              */}
              <div
                className="rounded-2xl px-5 py-4 text-center lg:text-left"
                style={{
                  background: "#FAF5E8",
                  border: "1px solid rgba(163,110,20,0.28)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
                  ⚓ Coming Soon
                </p>
                <p className="mt-1.5 font-display text-[17px] font-bold text-[var(--ink)]">
                  V1 Early Access registration coming soon…
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (Wallet Screenshots) */}
          <div
            className="relative w-full lg:w-[42%] flex flex-col items-center lg:items-end mt-12 lg:mt-0"
            style={rise(560)}
          >
            {/* Subtle gold glow behind screenshots */}
            <div className="relative flex items-end justify-center gap-3 sm:gap-5 md:gap-8 lg:gap-2.5 xl:gap-3.5">
              
              {/* Lock screen */}
              <div className="relative w-[100px] sm:w-[145px] md:w-[185px] lg:w-[105px] xl:w-[130px] shrink-0 wallet-card-left">
                <div className="overflow-hidden rounded-[20px] sm:rounded-[26px]"
                  style={{
                    border: "1px solid rgba(163,110,20,0.18)",
                    boxShadow: "0 24px 60px rgba(23,19,17,0.18), 0 8px 20px rgba(23,19,17,0.10), 0 1px 0 rgba(255,255,255,0.7) inset",
                  }}>
                  <Image src="/wallet/lock.webp" alt="Menoid unlock screen" width={480} height={760} className="w-full h-auto" />
                </div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">Unlock</span>
                </div>
              </div>

              {/* Open Mode — center hero */}
              <div className="relative z-10 w-[130px] sm:w-[180px] md:w-[230px] lg:w-[135px] xl:w-[165px] shrink-0 wallet-card-center">
                <div className="overflow-hidden rounded-[24px] sm:rounded-[30px]"
                  style={{
                    border: "1px solid rgba(163,110,20,0.22)",
                    boxShadow: "0 32px 80px rgba(23,19,17,0.22), 0 12px 32px rgba(163,110,20,0.14), 0 1px 0 rgba(255,255,255,0.7) inset",
                  }}>
                  <Image src="/wallet/openMOde.webp" alt="Menoid Open Mode" width={480} height={760} className="w-full h-auto" priority />
                </div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold-deep)]">Open Mode</span>
                </div>
              </div>

              {/* Noid Mode */}
              <div className="relative w-[100px] sm:w-[145px] md:w-[185px] lg:w-[105px] xl:w-[130px] shrink-0 wallet-card-right">
                <div className="overflow-hidden rounded-[20px] sm:rounded-[26px]"
                  style={{
                    border: "1px solid rgba(163,110,20,0.18)",
                    boxShadow: "0 24px 60px rgba(23,19,17,0.18), 0 8px 20px rgba(23,19,17,0.10), 0 1px 0 rgba(255,255,255,0.7) inset",
                  }}>
                  <Image src="/wallet/NoidMode.webp" alt="Menoid Noid Mode" width={480} height={760} className="w-full h-auto" />
                </div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">Noid Mode</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
