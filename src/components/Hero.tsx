"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CursorParticles from "./CursorParticles";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [focused, setFocused] = useState(false);

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

  useEffect(() => {
    const stored = localStorage.getItem("menoid_waitlist_registered");
    if (stored) {
      const timer = setTimeout(() => {
        setStatus("success");
        setSuccessMsg("You're already on the list. We'll reach out soon!");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setSuccessMsg(data.message || "You're on the list! Welcome to the crew.");
        localStorage.setItem("menoid_waitlist_registered", "true");
        localStorage.setItem("menoid_waitlist_email", email);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("success");
      setSuccessMsg("Welcome aboard! You've been added to the testnet waitlist.");
      localStorage.setItem("menoid_waitlist_registered", "true");
      localStorage.setItem("menoid_waitlist_email", email);
    }
  };

  return (
    <section id="top" className="grain relative overflow-hidden pt-28 pb-0">
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
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
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
                V1 Private Beta
              </span>
            </div>

            {/* AI-Native Label / Eyebrow */}
            <div
              className="font-mono text-[11px] sm:text-[12px] uppercase tracking-[0.32em] text-[var(--gold-deep)] mb-4 font-semibold"
              style={rise(100)}
            >
              AI-Native Private Wallet Across 15+ Chains
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
              Menoid is an AI-native private wallet built for absolute privacy across 15+ chains.
              Shield your assets and transact completely unseen along with hidden swaps, hidden bridges on Monad, Ethereum, Solana, Sui, and more, all in one place.
            </p>

            {/* ── Waitlist form ── */}
            <div
              id="waitlist"
              className="mx-auto lg:mx-0 max-w-md w-full"
              style={rise(440)}
            >
              {status !== "success" ? (
                <div>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-2 rounded-2xl p-1.5"
                    style={{
                      background: "#FAF5E8", // solid to hide particles underneath
                      border: focused ? "1px solid rgba(200,146,14,0.6)" : "1px solid rgba(163,110,20,0.22)",
                      boxShadow: focused
                        ? "0 0 0 3px rgba(232,174,58,0.2), 0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)"
                        : "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)",
                      transition: "all 300ms var(--ease-out-quart)",
                    }}
                  >
                    <input
                      id="hero-email-input"
                      type="email" required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      disabled={status === "loading"}
                      className="flex-1 bg-transparent px-4 py-2.5 text-[15px] text-[var(--ink)] placeholder-[var(--muted)] outline-none min-w-0"
                    />
                    <button
                      type="submit" id="hero-submit-btn"
                      disabled={status === "loading"}
                      className="btn-spring flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold whitespace-nowrap disabled:opacity-60"
                      style={{
                        background: "linear-gradient(135deg, #A36E14 0%, #C8920E 50%, #E8AE3A 100%)",
                        color: "#FBF1D9",
                        boxShadow: "0 0 0 1px rgba(163,110,20,0.35), 0 4px 16px rgba(200,146,14,0.30), 0 1px 0 rgba(255,255,255,0.25) inset",
                      }}
                    >
                      {status === "loading" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FBF1D9] border-t-transparent" />
                      ) : (
                        <>Claim Your Spot →</>
                      )}
                    </button>
                  </form>
                  {status === "error" && (
                    <p className="mt-2.5 text-center lg:text-left text-[12px] font-mono text-[var(--ember)]">{errorMsg}</p>
                  )}
                  <p className="mt-3 text-center lg:text-left font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                    No spam · Unsubscribe anytime
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl p-5 text-center lg:text-left animate-fade-in"
                  style={{
                    background: "#FAF5E8", // solid to hide particles underneath
                    border: "1px solid rgba(163,110,28,0.28)",
                    boxShadow: "var(--shadow-gold)",
                  }}
                >
                  <p className="font-display text-lg font-bold text-[var(--gold-deep)]">
                    ⚓ You&apos;re on the crew!
                  </p>
                  <p className="mt-1.5 text-[14px] text-[var(--ink-soft)]">{successMsg}</p>
                </div>
              )}
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
                  <Image src="/wallet/lock.png" alt="Menoid unlock screen" width={480} height={760} className="w-full h-auto" />
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
                  <Image src="/wallet/openMOde.png" alt="Menoid Open Mode" width={480} height={760} className="w-full h-auto" priority />
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
                  <Image src="/wallet/NoidMode.png" alt="Menoid Noid Mode" width={480} height={760} className="w-full h-auto" />
                </div>
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">Noid Mode</span>
                </div>
              </div>
            </div>
          </div>

        </div>
        <div className="h-16" />
      </div>
    </section>
  );
}
