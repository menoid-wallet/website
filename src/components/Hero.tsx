"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (ribbonRef.current) {
          ribbonRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
        }
        if (counterRef.current) {
          counterRef.current.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="top" className="relative px-3 pt-24 pb-6 sm:px-4 md:pt-28">
      <div className="relative mx-auto max-w-[1320px]">
        <div
          className="relative isolate overflow-hidden rounded-[28px] sm:rounded-[36px] md:rounded-[44px]"
          style={{
            background:
              "linear-gradient(180deg, #0e0a07 0%, #1a1410 55%, #0d0905 100%)",
            boxShadow:
              "0 40px 100px -20px rgba(26,20,16,0.45), 0 12px 32px -12px rgba(168,120,8,0.16)",
          }}
        >
          {/* Ribbons backdrop (parallaxed) */}
          <div ref={ribbonRef} className="absolute inset-0 will-change-transform">
            <RibbonsBackdrop />
          </div>

          {/* Counter-parallax overlay */}
          <div ref={counterRef} className="absolute inset-0 will-change-transform">
            <RibbonsBackdropOverlay />
          </div>

          {/* Vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0) 70%)",
            }}
          />

          {/* Decorative cartouche frame */}
          <div className="pointer-events-none absolute inset-4 rounded-[24px] border border-white/[0.04] sm:inset-6 md:inset-8" />
          <div className="pointer-events-none absolute inset-6 rounded-[20px] border border-white/[0.025] sm:inset-8 md:inset-10" />

          {/* Content */}
          <div className="relative flex min-h-[78vh] flex-col items-center justify-center px-6 py-24 text-center md:min-h-[88vh] md:py-32">
            <p
              className="font-mono text-[12px] uppercase tracking-[0.32em] text-white/65 md:text-[13px]"
              style={{
                opacity: 0,
                animation: "float-in 900ms var(--ease-out-quart) 200ms forwards",
              }}
            >
              The wallet that keeps your secret
            </p>

            <h1
              className="mt-5 max-w-[14ch] font-display text-[clamp(48px,9vw,150px)] font-black leading-[0.92] tracking-[-0.038em] text-white md:max-w-none"
              style={{
                opacity: 0,
                animation: "float-in 1100ms var(--ease-out-quart) 360ms forwards",
              }}
            >
              Your home for{" "}
              <em className="font-display font-light italic text-white/95">private</em>{" "}
              crypto, <br className="hidden sm:block" />
              shielded{" "}
              <em className="font-display font-light italic text-white/95">on Monad.</em>
            </h1>

            <p
              className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 md:text-[17px]"
              style={{
                opacity: 0,
                animation: "float-in 900ms var(--ease-out-quart) 520ms forwards",
              }}
            >
              Menoid is a self-custody wallet with two faces — Open for the
              public seas, and Noid for zero-knowledge stealth. Mask in,
              transact unseen, unmask out.
            </p>

            <div
              className="mt-10 flex items-center gap-3"
              style={{
                opacity: 0,
                animation: "float-in 800ms var(--ease-out-quart) 680ms forwards",
              }}
            >
              <a
                href="#download"
                className="btn-spring group inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-3.5 text-[15px] font-semibold text-black"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 32px -10px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.30)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="6" y="2" width="12" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="18" r="1.2" fill="currentColor" />
                </svg>
                Download Menoid
              </a>
              <a
                href="#how"
                className="btn-spring hidden items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3.5 text-[15px] font-medium text-white/90 backdrop-blur-md sm:inline-flex"
              >
                How it works
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
            </div>

            {/* Chip row */}
            <div
              className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45"
              style={{
                opacity: 0,
                animation: "float-in 900ms var(--ease-out-quart) 880ms forwards",
              }}
            >
              {["Open mode", "Noid mode · ZK", "Mask / Unmask", "Monad"].map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono backdrop-blur-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40">
            <svg width="22" height="36" viewBox="0 0 22 36" fill="none" aria-hidden>
              <rect x="1" y="1" width="20" height="34" rx="10" stroke="currentColor" strokeOpacity="0.5" />
              <circle cx="11" cy="10" r="2.5" fill="currentColor">
                <animate attributeName="cy" from="10" to="24" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── ribbons ───────────────────────── */

function RibbonsBackdrop() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="r-gold" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#a87808" stopOpacity="0" />
          <stop offset="30%" stopColor="#d4a017" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#f0d98b" stopOpacity="1" />
          <stop offset="100%" stopColor="#7c5a0a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-blue" x1="0" y1="0.2" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#0b3b8a" stopOpacity="0" />
          <stop offset="25%" stopColor="#1f55c8" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#3884ff" stopOpacity="1" />
          <stop offset="100%" stopColor="#0c2d6e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-red" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#5a1a0a" stopOpacity="0" />
          <stop offset="35%" stopColor="#c0381a" stopOpacity="0.95" />
          <stop offset="80%" stopColor="#f06b3a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3a0d05" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-green" x1="0" y1="0.1" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#0e3a26" stopOpacity="0" />
          <stop offset="40%" stopColor="#2a8455" stopOpacity="0.9" />
          <stop offset="80%" stopColor="#5fb98a" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0d2a1c" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-grey" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#2a2a2e" stopOpacity="0" />
          <stop offset="40%" stopColor="#6b6e76" stopOpacity="0.85" />
          <stop offset="80%" stopColor="#a8acb5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1f2024" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="r-lav" x1="0" y1="0.1" x2="1" y2="0.5">
          <stop offset="0%" stopColor="#2e1f5a" stopOpacity="0" />
          <stop offset="40%" stopColor="#6f5dd6" stopOpacity="0.9" />
          <stop offset="80%" stopColor="#a895ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1c1140" stopOpacity="0" />
        </linearGradient>
        <filter id="r-soft">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>

      <g filter="url(#r-soft)" strokeLinecap="round" fill="none">
        <path d="M -160 760 C 220 540, 560 660, 900 420 S 1500 220, 1820 120" stroke="url(#r-gold)" strokeWidth="34" />
        <path d="M -200 640 C 260 460, 620 540, 980 320 S 1520 120, 1820 40"   stroke="url(#r-blue)" strokeWidth="40" />
        <path d="M -220 820 C 200 700, 540 760, 900 540 S 1500 380, 1820 320" stroke="url(#r-red)"  strokeWidth="22" />
        <path d="M -120 460 C 240 320, 600 420, 980 220 S 1500 80,  1840 -40" stroke="url(#r-green)" strokeWidth="18" />
        <path d="M -180 720 C 240 580, 620 640, 980 420 S 1520 240, 1860 160" stroke="url(#r-grey)" strokeWidth="14" />
        <path d="M -200 880 C 220 800, 600 820, 980 660 S 1520 520, 1860 480" stroke="url(#r-lav)"  strokeWidth="26" />
        <path d="M -160 540 C 240 400, 620 480, 980 280 S 1520 160, 1860 80"  stroke="url(#r-gold)" strokeWidth="10" />
        <path d="M -240 820 C 200 760, 540 700, 900 560 S 1500 460, 1820 420" stroke="url(#r-blue)" strokeWidth="8"  />
      </g>
    </svg>
  );
}

function RibbonsBackdropOverlay() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-70 mix-blend-screen"
    >
      <g strokeLinecap="round" fill="none">
        <path d="M -100 200 C 260 360, 560 280, 920 460 S 1480 600, 1820 720" stroke="url(#r-blue)"  strokeWidth="6" opacity="0.8" />
        <path d="M -100 300 C 260 440, 560 360, 920 540 S 1480 680, 1820 800" stroke="url(#r-gold)"  strokeWidth="4" opacity="0.7" />
      </g>
    </svg>
  );
}
