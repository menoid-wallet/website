import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lost at sea — Menoid",
  description: "This shore isn't on the map.",
};

export default function NotFound() {
  return (
    <main
      className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
      style={{ background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)" }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />
      {/* Floating orbs */}
      <div className="orb orb-1 absolute" style={{ top: "-12%", right: "-10%", width: "min(80vw,420px)", height: "min(80vw,420px)" }} />
      <div className="orb orb-2 absolute" style={{ bottom: "-14%", left: "-12%", width: "min(86vw,460px)", height: "min(86vw,460px)" }} />

      {/* Spinning compass */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-[0.06] select-none">
        <svg width="640" height="640" viewBox="0 0 800 800" fill="none" className="compass-slow">
          <circle cx="400" cy="400" r="380" stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="4 8" />
          <circle cx="400" cy="400" r="280" stroke="var(--gold)" strokeWidth="0.8" />
          <circle cx="400" cy="400" r="180" stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="16 8" />
          <line x1="400" y1="0" x2="400" y2="800" stroke="var(--gold)" strokeWidth="0.8" />
          <line x1="0" y1="400" x2="800" y2="400" stroke="var(--gold)" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Meno */}
        <div className="relative mb-2 h-44 w-44 gentle-bob sm:h-52 sm:w-52">
          <Image
            src="/meno/meno_hi.webp"
            alt="Meno the pirate"
            fill
            sizes="208px"
            priority
            className="object-contain drop-shadow-[0_18px_30px_rgba(163,110,20,0.3)]"
          />
        </div>

        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold-deep)]">
          ✦ Lost at sea ✦
        </p>

        <h1
          className="font-display font-black leading-none tracking-[-0.04em] text-[var(--ink)]"
          style={{ fontSize: "clamp(72px, 16vw, 160px)" }}
        >
          4<span className="shimmer-gold">0</span>4
        </h1>

        <h2
          className="mt-4 font-display font-black tracking-[-0.03em] text-[var(--ink)]"
          style={{ fontSize: "clamp(22px, 3.4vw, 36px)" }}
        >
          This treasure isn&apos;t on the map.
        </h2>

        <p className="mx-auto mt-3 max-w-md text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink-soft)]">
          The page you&apos;re hunting for has drifted off into the shadow waters. Let&apos;s sail
          you back to safe harbor.
        </p>

        <Link
          href="/"
          className="btn-spring mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold"
          style={{
            background: "linear-gradient(135deg, #A36E14 0%, #C8920E 50%, #E8AE3A 100%)",
            color: "#FBF1D9",
            boxShadow:
              "0 0 0 1px rgba(163,110,20,0.35), 0 4px 16px rgba(200,146,14,0.30), 0 1px 0 rgba(255,255,255,0.25) inset",
          }}
        >
          ⚓ Back to safe harbor
        </Link>
      </div>
    </main>
  );
}
