"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useEffect, useRef } from "react";

interface CardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bullets?: string[];
}

interface PanelProps {
  index: number;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bullets: string[];
}

const OPEN_MODE_BOXES = [
  {
    title: "Create Wallet",
    description: "Initialize your standard public EOA wallet to start managing your assets.",
    imageSrc: "/wallet_modes/create_wallet_2.png",
    imageAlt: "Create Wallet Screen",
    bullets: [
      "Standard EOA setup in seconds",
      "Secure local seed phrase generation",
      "Full Monad & EVM compatibility",
    ],
  },
  {
    title: "Use the Wallet",
    description: "Transfer, swap, and interact publicly just like every other wallet.",
    imageSrc: "/wallet_modes/ship_send.png",
    imageAlt: "Use the Wallet Screen",
    bullets: [
      "Public transfer, swap, and bridge",
      "Direct dApp connectivity & transactions",
      "Transparent on-chain transaction history",
    ],
  },
];

const NOID_MODE_PANELS = [
  {
    eyebrow: "Shield",
    title: "Hide Your Funds",
    description:
      "Move assets from your public balance into the shielded Noid pool. Once hidden, your holdings are cryptographically detached from your public address — invisible on-chain, yet always provably yours.",
    imageSrc: "/wallet_modes/mask.png",
    imageAlt: "Hide Your Funds Screen",
    bullets: [
      "Privatize any token balance instantly",
      "Deposit into the zero-knowledge pool",
      "Break the link to your public EOA",
      "Funds stay locked and provably yours",
    ],
  },
  {
    eyebrow: "Transfer",
    title: "Hidden Transfer",
    description:
      "Send value to anyone without revealing who, what, or how much. Transfers settle inside the shielded pool and are verified by zero-knowledge proofs instead of a public ledger.",
    imageSrc: "/wallet_modes/hidden_trasnfer_successful.png",
    imageAlt: "Hidden Transfer Screen",
    bullets: [
      "Send anonymously to any address",
      "Amounts and recipients stay private",
      "Verified by zero-knowledge proofs",
      "No traceable sender-to-receiver link",
    ],
  },
  {
    eyebrow: "Withdraw",
    title: "Unhide Your Funds",
    description:
      "Step back into open mode whenever you want. Withdraw from the shielded pool to any clean address with instant liquidity and zero waiting periods — privacy on your terms.",
    imageSrc: "/wallet_modes/unmask_meno.png",
    imageAlt: "Unhide Your Funds Screen",
    bullets: [
      "Withdraw to any clean EOA on demand",
      "Instant decryption and liquidity",
      "No lockups or cooldown windows",
      "Re-enter public mode safely anytime",
    ],
  },
  {
    eyebrow: "Actions",
    title: "Hidden Actions",
    description:
      "Don't just hold privately — act privately. Swap, bridge, and NFTs entirely inside the shielded pool, so every move you make stays completely unseen on-chain.",
    imageSrc: "/meno/hidden_swaps.png",
    imageAlt: "Hidden swaps and bridges",
    bullets: [
      "Hidden swaps with zero trace",
      "Hidden cross-chain bridges",
      "Hidden holdings, positions, perps, staking, etc.",
      "Across 15+ chains.",
    ],
  },
];

const Check = () => (
  <svg
    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold-bright)]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* Goldish-yellow open-mode card (kept exactly as before). */
function ModeCard({ title, description, imageSrc, imageAlt, bullets }: CardProps) {
  return (
    <div
      className="group grain relative flex h-full flex-col overflow-hidden rounded-[24px] p-6 transition-shadow duration-300 hover:shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)",
        border: "1px solid rgba(163, 110, 20, 0.28)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.10), 0 1px 0 rgba(255, 255, 255, 0.9) inset",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="relative mb-5 h-[190px] w-full shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex flex-1 flex-col">
          <h4 className="mb-2 font-display text-[20px] font-bold text-[var(--ink)]">{title}</h4>
          <p className="mb-5 text-[14px] font-light leading-relaxed text-[var(--ink-soft)]">
            {description}
          </p>

          {bullets && bullets.length > 0 && (
            <ul className="mt-auto space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[13px]">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="font-light text-[var(--ink-soft)]">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* Wide, dark transparent-glass panel for Noid mode: image left, content right. */
function NoidPanel({ index, eyebrow, title, description, imageSrc, imageAlt, bullets }: PanelProps) {
  return (
    <div
      className="noid-panel relative w-full overflow-hidden rounded-[28px]"
      style={{
        background:
          "linear-gradient(150deg, rgba(38,31,25,0.90) 0%, rgba(21,17,15,0.88) 100%)",
        border: "1px solid rgba(232,174,58,0.16)",
        boxShadow:
          "0 34px 80px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset",
        backdropFilter: "blur(24px) saturate(120%)",
        WebkitBackdropFilter: "blur(24px) saturate(120%)",
      }}
    >
      {/* Soft grid + glow inside the glass */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity: 0.05,
          backgroundImage:
            "linear-gradient(to right,#FBF1D9 1px,transparent 1px),linear-gradient(to bottom,#FBF1D9 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          top: "-30%",
          right: "-8%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,174,58,0.16) 0%, transparent 62%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 grid grid-cols-1 items-center gap-6 p-5 md:grid-cols-[0.92fr_1.08fr] md:gap-10 md:p-8">
        {/* Image (left) */}
        <div
          className="relative h-[230px] w-full shrink-0 overflow-hidden rounded-2xl md:h-[330px]"
          style={{
            background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.18))",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-contain p-3"
          />
        </div>

        {/* Content (right) */}
        <div className="flex flex-col">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[13px] font-semibold tracking-[0.2em] text-[var(--gold-bright)]">
              0{index + 1}
            </span>
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, rgba(232,174,58,0.45), rgba(232,174,58,0.05))",
              }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#9b8a73]">
              {eyebrow}
            </span>
          </div>

          <h4
            className="font-display font-black tracking-[-0.02em] text-[#FBF1D9]"
            style={{ fontSize: "clamp(24px, 2.6vw, 34px)" }}
          >
            {title}
          </h4>

          <p className="mt-3 max-w-xl text-[14px] font-light leading-relaxed text-[#C9BBAA] md:text-[15px]">
            {description}
          </p>

          <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[13px]">
                <Check />
                <span className="font-light text-[#D8CCBA]">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* Small section header used for "Open Mode" / "Noid Mode". */
function ModeHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Reveal className="mb-10 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)]">
        {eyebrow}
      </p>
      <h3
        className="mt-2 font-display font-black tracking-[-0.03em] text-[#FBF1D9]"
        style={{ fontSize: "clamp(26px, 3.4vw, 42px)" }}
      >
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-[#C9BBAA] sm:text-[15px]">
        {subtitle}
      </p>
    </Reveal>
  );
}

export default function WalletModes() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const darkBoxRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Open row + card refs (scroll-driven spread effect — kept as before)
  const openRowRef = useRef<HTMLDivElement | null>(null);
  const openCard0Ref = useRef<HTMLDivElement | null>(null);
  const openCard1Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const viewHeight = window.innerHeight;

      // ── 1. Expanding Dark Box ─────────────────────────────────────────────
      const section = sectionRef.current;
      const darkBox = darkBoxRef.current;
      const content = contentRef.current;
      if (section && darkBox && content) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= viewHeight) {
          const boxP = (viewHeight - rect.top) / viewHeight;
          const clampedBoxP = Math.max(0, Math.min(1, boxP));

          let width = 60;
          let borderRadius = 48;
          let marginTop = 0;

          if (clampedBoxP < 0.5) {
            const t = clampedBoxP / 0.5;
            width = 60 + t * (95 - 60);
            borderRadius = 48 - t * (48 - 20);
          } else if (clampedBoxP < 0.6) {
            const t = (clampedBoxP - 0.5) / 0.1;
            width = 95 + t * (100 - 95);
            borderRadius = 20 - t * 20;
          } else {
            width = 100;
            borderRadius = 0;
          }

          if (clampedBoxP < 0.6) {
            const t = clampedBoxP / 0.6;
            marginTop = -t * 80;
          } else {
            marginTop = -80;
          }

          darkBox.style.width = `${width}%`;
          darkBox.style.borderRadius = `${borderRadius}px`;
          darkBox.style.marginTop = `${marginTop}px`;

          content.style.opacity = "1";
          content.style.transform = "none";
        }
      }

      // ── 2. Open Mode cards stack-and-spread ───────────────────────────────
      const openRow = openRowRef.current;
      const openCard0 = openCard0Ref.current;
      const openCard1 = openCard1Ref.current;
      if (openRow && openCard0 && openCard1) {
        const r = openRow.getBoundingClientRect();
        const start = viewHeight * 0.85;
        const end = viewHeight * 0.5;
        const p = (start - r.top) / (start - end);
        const cp = Math.max(0, Math.min(1, p)); // 0 = stacked, 1 = spread
        const factor = 1 - cp; // 1 = stacked, 0 = spread

        openCard0.style.setProperty("--spread-factor", `${factor}`);
        openCard1.style.setProperty("--spread-factor", `${factor}`);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="wallet-modes"
      className="grain relative py-0"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      <div
        className="mx-auto mb-20 max-w-6xl h-px relative z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(200,146,14,0.2) 30%, rgba(200,146,14,0.2) 70%, transparent)",
        }}
      />

      <div
        ref={darkBoxRef}
        className="relative mx-auto flex justify-center z-10"
        style={{
          background: "#171311",
          width: "60%",
          borderRadius: "48px",
          transition:
            "width 120ms cubic-bezier(0.215, 0.61, 0.355, 1), border-radius 120ms cubic-bezier(0.215, 0.61, 0.355, 1), margin-top 120ms cubic-bezier(0.215, 0.61, 0.355, 1)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
        }}
      >
        {/* Decorative clip layer (orbs/grid/sheen) — keeps the dark box itself overflow-visible
            so the sticky Noid panels can stick to the viewport. */}
        <div
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
          style={{ borderRadius: "inherit" }}
        >
          <div
            className="absolute inset-0"
            style={{
              opacity: 0.04,
              backgroundImage:
                "linear-gradient(to right,#FBF1D9 1px,transparent 1px),linear-gradient(to bottom,#FBF1D9 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="absolute"
            style={{
              top: "2%",
              right: "-5%",
              width: 350,
              height: 350,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(232,174,58,0.18) 0%, transparent 60%)",
              filter: "blur(60px)",
              animation: "noidBgOrb1 14s ease-in-out infinite",
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: "4%",
              left: "-5%",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(163,110,20,0.15) 0%, transparent 60%)",
              filter: "blur(64px)",
              animation: "noidBgOrb2 11s ease-in-out infinite 3s",
            }}
          />
          <div className="sheen absolute inset-0" style={{ opacity: 0.15 }} />
        </div>

        <div
          ref={contentRef}
          className="w-full max-w-6xl shrink-0 px-4 sm:px-6 py-28 z-10 flex flex-col gap-16"
          style={{
            opacity: 0,
            transform: "translateY(30px)",
            transition: "opacity 180ms ease-out, transform 180ms ease-out",
          }}
        >
          {/* Intro */}
          <Reveal className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)] mb-3">
              ✦ Two Modes, One Wallet ✦
            </p>
            <h2
              className="font-display font-black tracking-[-0.035em] text-[#FBF1D9]"
              style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}
            >
              Sail open, or sail{" "}
              <em className="font-display font-light italic text-[#E8AE3A]">hidden</em> with Menoid.
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-[14px] sm:text-[15px] leading-relaxed text-[#C9BBAA]">
              Menoid holds two accounts simultaneously. Switch seamlessly between your EOA profile
              and your encrypted profile — open when you want to be seen, hidden when you don&apos;t.
            </p>
          </Reveal>

          {/* ─────────────────── OPEN MODE ─────────────────── */}
          <div>
            <ModeHeader
              eyebrow="Mode 01 · Open"
              title="Open Mode"
              subtitle="Your public EOA for everyday on-chain life — create a wallet and transact in the clear, exactly like any other wallet."
            />

            <div className="flex flex-col items-center">
              <div ref={openRowRef} className="open-container relative w-full max-w-5xl">
                <div className="open-container grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-16 pb-4 overflow-visible">
                  <div ref={openCard0Ref} className="scroll-card-wrapper open-card-0">
                    <div className="card-hover-wrapper">
                      <ModeCard {...OPEN_MODE_BOXES[0]} />
                    </div>
                  </div>
                  <div ref={openCard1Ref} className="scroll-card-wrapper open-card-1">
                    <div className="card-hover-wrapper">
                      <ModeCard {...OPEN_MODE_BOXES[1]} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────── NOID MODE ─────────────────── */}
          <div>
            <ModeHeader
              eyebrow="Mode 02 · Noid"
              title="Noid Mode"
              subtitle="Slip beneath the surface. Shield balances, move value privately, and Act privately without leaving a trace — all secured by zero-knowledge proofs."
            />

            {/* Sticky stacking deck — each panel locks on top of the previous as you scroll. */}
            <div className="noid-stack mx-auto w-full max-w-5xl">
              {NOID_MODE_PANELS.map((panel, idx) => (
                <div
                  key={panel.title}
                  className="noid-stack-item"
                  style={{ top: `calc(96px + ${idx} * 24px)`, zIndex: 10 + idx }}
                >
                  <NoidPanel index={idx} {...panel} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes noidBgOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 25px) scale(1.12); }
        }
        @keyframes noidBgOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.15); }
        }

        /* ── Open Mode cards: scroll-driven stack + spread (unchanged behaviour) ── */
        .scroll-card-wrapper {
          transform: translate3d(
            calc(var(--spread-factor, 1) * (var(--center-x-pct, 0%) + var(--center-x-px, 0px) + var(--stack-x-offset, 0px))),
            calc(var(--spread-factor, 1) * (var(--center-y-pct, 0%) + var(--center-y-px, 0px) + var(--stack-y-offset, 0px))),
            0
          ) rotate(calc(var(--spread-factor, 1) * var(--stack-rotate, 0deg)));
          transform-style: preserve-3d;
          will-change: transform;
        }

        .card-hover-wrapper {
          --hover-offset-x: 0px;
          --hover-offset-y: 0px;
          --hover-offset-r: 0deg;
          --hover-lift-y: 0px;

          transform: translate3d(
            calc(var(--spread-factor, 1) * var(--hover-offset-x, 0px)),
            calc(var(--spread-factor, 1) * var(--hover-offset-y, 0px) + var(--hover-lift-y, 0px)),
            0
          ) rotate(calc(var(--spread-factor, 1) * var(--hover-offset-r, 0deg)));

          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease;
          will-change: transform;
          height: 100%;
        }

        .open-card-0 {
          --center-x-pct: 50%;
          --center-x-px: 32px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 0deg;
          --stack-x-offset: 0px;
          --stack-y-offset: 0px;
        }

        .open-card-1 {
          --center-x-pct: -50%;
          --center-x-px: -32px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 3deg;
          --stack-x-offset: 35px;
          --stack-y-offset: 0px;
        }

        @media (max-width: 767px) {
          .open-card-0 {
            --center-x-pct: 0%;
            --center-x-px: 0px;
            --center-y-pct: 50%;
            --center-y-px: 16px;
          }
          .open-card-1 {
            --center-x-pct: 0%;
            --center-x-px: 0px;
            --center-y-pct: -50%;
            --center-y-px: -16px;
            --stack-y-offset: 25px;
          }
        }

        @media (min-width: 768px) {
          .open-container:hover .open-card-1 {
            --hover-offset-x: 35px;
            --hover-offset-r: 3.5deg;
          }
        }
        @media (max-width: 767px) {
          .open-container:hover .open-card-1 {
            --hover-offset-y: 25px;
            --hover-offset-r: 3.5deg;
          }
        }

        .card-hover-wrapper:hover {
          --hover-lift-y: -15px;
        }

        /* ── Noid Mode: sticky stacking deck ── */
        .noid-stack {
          position: relative;
          padding-bottom: 8px;
        }
        .noid-stack-item {
          position: -webkit-sticky;
          position: sticky;
          /* top + z-index set inline per item */
        }
        .noid-stack-item:not(:last-child) {
          margin-bottom: 90px;
        }
        .noid-panel {
          transition: box-shadow 0.4s ease;
        }
        @media (max-width: 767px) {
          .noid-stack-item:not(:last-child) {
            margin-bottom: 56px;
          }
        }
      `}</style>
    </section>
  );
}
