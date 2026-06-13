"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useEffect, useRef, useState } from "react";

interface BoxProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  bullets?: string[];
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

const NOID_MODE_BOXES = [
  {
    title: "Hide Your Funds",
    description: "Hide and lock your funds in the Noid pool.",
    imageSrc: "/wallet_modes/mask.png",
    imageAlt: "Hide Your Funds Screen",
    bullets: [
      "Fully privatize on-chain balances",
      "Deposit assets into ZK pool",
    ],
  },
  {
    title: "Hidden Transfer",
    description: "Transfer privately to any user.",
    imageSrc: "/wallet_modes/hidden_trasnfer_successful.png",
    imageAlt: "Hidden Transfer Screen",
    bullets: [
      "Send funds anonymously to any address",
      "Zero-knowledge proof verification",
    ],
  },
  {
    title: "Unhide Your Funds",
    description: "Unhide your funds to open mode any time safely.",
    imageSrc: "/wallet_modes/unmask_meno.png",
    imageAlt: "Unhide Your Funds Screen",
    bullets: [
      "Withdraw to any clean EOA at any time",
      "Instant liquidity decryption",
    ],
  },
  {
    title: "Noid Accounts",
    description: "Interact with dapps privately with Noid smart accounts.",
    imageSrc: "/wallet_modes/create_noid_account.png",
    imageAlt: "Noid Smart Account Screen",
    bullets: [
      "Interact with dApps anonymously",
      "DeFi execution with shielded identity",
    ],
  },
];

/* A styled card matching the hero section: goldish-yellow gradient background, grid, and grain. */
function ModeCard({ title, description, imageSrc, imageAlt, bullets }: BoxProps) {
  return (
    <div
      className="group grain relative flex h-full flex-col overflow-hidden rounded-[24px] p-6 transition-shadow duration-300 hover:shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)",
        border: "1px solid rgba(163, 110, 20, 0.28)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.10), 0 1px 0 rgba(255, 255, 255, 0.9) inset",
      }}
    >
      {/* Grid Pattern matching the Hero background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      {/* Content wrapper with higher z-index to overlay on background/grid/grain */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Image */}
        <div className="relative mb-5 h-[190px] w-full shrink-0 overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <h4 className="mb-2 font-display text-[20px] font-bold text-[var(--ink)]">
            {title}
          </h4>
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

export default function WalletModes() {
  const [activeMode, setActiveMode] = useState<"open" | "noid">("open");
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const darkBoxRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Open Row container ref
  const openRowRef = useRef<HTMLDivElement | null>(null);

  // Noid cards ref
  const noidCardsRef = useRef<HTMLDivElement | null>(null);

  // Individual card refs for scroll-driven animations
  const openCard0Ref = useRef<HTMLDivElement | null>(null);
  const openCard1Ref = useRef<HTMLDivElement | null>(null);
  
  const noidCard0Ref = useRef<HTMLDivElement | null>(null);
  const noidCard1Ref = useRef<HTMLDivElement | null>(null);
  const noidCard2Ref = useRef<HTMLDivElement | null>(null);
  const noidCard3Ref = useRef<HTMLDivElement | null>(null);

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

      const openRow = openRowRef.current;

      // ── 3. Noid cards grid fade-in ────────────────────────────────────────
      const noidCards = noidCardsRef.current;
      if (noidCards) {
        const r = noidCards.getBoundingClientRect();
        const p = (viewHeight * 0.85 - r.top) / (viewHeight * 0.3);
        const cp = Math.max(0, Math.min(1, p));
        noidCards.style.opacity = `${cp}`;
      }

      // ── 4. Open Mode Cards Stack and Spread ───────────────────────────────
      const openCard0 = openCard0Ref.current;
      const openCard1 = openCard1Ref.current;
      if (openRow && openCard0 && openCard1) {
        const r = openRow.getBoundingClientRect();
        const start = viewHeight * 0.85;
        const end = viewHeight * 0.50;
        const p = (start - r.top) / (start - end);
        const cp = Math.max(0, Math.min(1, p)); // 0 = stacked, 1 = spread
        const factor = 1 - cp; // 1 = stacked, 0 = spread

        openCard0.style.setProperty("--spread-factor", `${factor}`);
        openCard1.style.setProperty("--spread-factor", `${factor}`);
      }

      // ── 5. Noid Mode Cards Stack and Spread ───────────────────────────────
      const noidCard0 = noidCard0Ref.current;
      const noidCard1 = noidCard1Ref.current;
      const noidCard2 = noidCard2Ref.current;
      const noidCard3 = noidCard3Ref.current;
      if (noidCards && noidCard0 && noidCard1 && noidCard2 && noidCard3) {
        const r = noidCards.getBoundingClientRect();
        const start = viewHeight * 0.85;
        const end = viewHeight * 0.50;
        const p = (start - r.top) / (start - end);
        const cp = Math.max(0, Math.min(1, p)); // 0 = stacked, 1 = spread
        const factor = 1 - cp; // 1 = stacked, 0 = spread

        noidCard0.style.setProperty("--spread-factor", `${factor}`);
        noidCard1.style.setProperty("--spread-factor", `${factor}`);
        noidCard2.style.setProperty("--spread-factor", `${factor}`);
        noidCard3.style.setProperty("--spread-factor", `${factor}`);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeMode]);

  return (
    <section
      ref={sectionRef}
      id="wallet-modes"
      className="grain relative overflow-hidden py-0"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-0"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
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
        className="relative mx-auto flex justify-center overflow-hidden z-10"
        style={{
          background: "#171311",
          width: "60%",
          borderRadius: "48px",
          transition:
            "width 120ms cubic-bezier(0.215, 0.61, 0.355, 1), border-radius 120ms cubic-bezier(0.215, 0.61, 0.355, 1), margin-top 120ms cubic-bezier(0.215, 0.61, 0.355, 1)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(to right,#FBF1D9 1px,transparent 1px),linear-gradient(to bottom,#FBF1D9 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div
          className="absolute z-0 pointer-events-none"
          style={{
            top: "-10%",
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
          className="absolute z-0 pointer-events-none"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,110,20,0.15) 0%, transparent 60%)",
            filter: "blur(64px)",
            animation: "noidBgOrb2 11s ease-in-out infinite 3s",
          }}
        />

        <div className="sheen absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }} />

        <div
          ref={contentRef}
          className="w-full max-w-6xl shrink-0 px-4 sm:px-6 py-28 z-10 flex flex-col gap-12"
          style={{
            opacity: 0,
            transform: "translateY(30px)",
            transition: "opacity 180ms ease-out, transform 180ms ease-out",
          }}
        >
          <Reveal className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)] mb-3">
              ✦ Two Modes, One Wallet ✦
            </p>
            <h2
              className="font-display font-black tracking-[-0.035em] text-[#FBF1D9]"
              style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}
            >
              Sail open, or sail in the{" "}
              <em className="font-display font-light italic text-[#E8AE3A]">shadow waters.</em>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-[14px] sm:text-[15px] leading-relaxed text-[#C9BBAA] mb-8">
              Menoid holds two accounts simultaneously. Switch seamlessly between your public EOA
              profile for everyday activities and your ZK profile for shielded stealth operations.
            </p>

            {/* Premium Toggle Switch Styled to match image */}
            <div className="flex justify-center mt-6 mb-12">
              <div 
                className="relative p-1 rounded-full flex items-center cursor-pointer w-[280px] h-[52px]"
                onClick={() => setActiveMode(activeMode === "open" ? "noid" : "open")}
                style={{
                  background: "#F1E3C3",
                  border: "1.5px solid #FAF5E8",
                  boxShadow: "inset 0 2px 4px rgba(163,110,20,0.12), 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(0,0,0,0.08)"
                }}
              >
                {/* Dark Charcoal Sliding Background */}
                <div 
                  className="absolute top-1 bottom-1 left-1 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{
                    width: "136px",
                    background: "#171311",
                    transform: activeMode === "open" ? "translateX(0)" : "translateX(136px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                  }}
                />
                
                {/* Option 1: OPEN */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveMode("open"); }}
                  className={`relative z-10 w-1/2 h-full flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[14px] transition-colors duration-300 outline-none ${
                    activeMode === "open" 
                      ? "text-[#FBF1D9]" 
                      : "text-[#8A7056] hover:text-[#171311]"
                  }`}
                >
                  OPEN
                </button>
                
                {/* Option 2: NOID */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveMode("noid"); }}
                  className={`relative z-10 w-1/2 h-full flex items-center justify-center font-sans font-bold uppercase tracking-widest text-[14px] transition-colors duration-300 outline-none ${
                    activeMode === "noid" 
                      ? "text-[#FBF1D9]" 
                      : "text-[#8A7056] hover:text-[#171311]"
                  }`}
                >
                  NOID
                </button>
              </div>
            </div>
          </Reveal>

          <div className="relative w-full min-h-[420px]">
            {/* ─────────────────── OPEN MODE ─────────────────── */}
            <div 
              className={`w-full transition-all duration-500 ease-out ${
                activeMode === "open" 
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto relative" 
                  : "opacity-0 translate-y-8 scale-95 pointer-events-none absolute inset-x-0 top-0 -z-10"
              }`}
            >
              <div className="flex flex-col items-center">
                {/* Cards row */}
                <div ref={openRowRef} className="open-container relative w-full max-w-5xl">

                  {/* Two cards side by side */}
                  <div className="open-container grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-16 pb-12 overflow-visible">
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
            <div 
              className={`w-full transition-all duration-500 ease-out ${
                activeMode === "noid" 
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto relative" 
                  : "opacity-0 translate-y-8 scale-95 pointer-events-none absolute inset-x-0 top-0 -z-10"
              }`}
            >
              <div className="flex flex-col items-center">
                <div
                  ref={noidCardsRef}
                  className="noid-container w-full max-w-5xl grid grid-cols-1 sm:grid-cols-4 gap-6 z-10 pb-16 overflow-visible"
                  style={{ opacity: 0 }}
                >
                  {NOID_MODE_BOXES.map((box, idx) => {
                    const cardRef = idx === 0 ? noidCard0Ref : idx === 1 ? noidCard1Ref : idx === 2 ? noidCard2Ref : noidCard3Ref;
                    return (
                      <div key={box.title} ref={cardRef} className={`scroll-card-wrapper noid-card-${idx}`}>
                        <div className="card-hover-wrapper">
                          <ModeCard {...box} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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

        /* 3D and positioning variables for Open Mode Card 0 */
        .open-card-0 {
          --center-x-pct: 50%;
          --center-x-px: 32px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 0deg;
          --stack-x-offset: 0px;
          --stack-y-offset: 0px;
        }

        /* Open Mode Card 1 */
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

        /* Noid Mode Card 0 */
        .noid-card-0 {
          --center-x-pct: 150%;
          --center-x-px: 36px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 0deg;
          --stack-x-offset: 0px;
          --stack-y-offset: 0px;
        }

        /* Noid Mode Card 1 */
        .noid-card-1 {
          --center-x-pct: 50%;
          --center-x-px: 12px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 2.5deg;
          --stack-x-offset: 35px;
          --stack-y-offset: 5px;
        }

        /* Noid Mode Card 2 */
        .noid-card-2 {
          --center-x-pct: -50%;
          --center-x-px: -12px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 5deg;
          --stack-x-offset: 70px;
          --stack-y-offset: 10px;
        }

        /* Noid Mode Card 3 */
        .noid-card-3 {
          --center-x-pct: -150%;
          --center-x-px: -36px;
          --center-y-pct: 0%;
          --center-y-px: 0px;
          --stack-rotate: 7.5deg;
          --stack-x-offset: 105px;
          --stack-y-offset: 15px;
        }

        @media (max-width: 767px) {
          .noid-card-0 {
            --center-x-pct: 0%;
            --center-x-px: 0px;
            --center-y-pct: 150%;
            --center-y-px: 36px;
          }
          .noid-card-1 {
            --center-x-pct: 0%;
            --center-x-px: 0px;
            --center-y-pct: 50%;
            --center-y-px: 12px;
            --stack-y-offset: 20px;
          }
          .noid-card-2 {
            --center-x-pct: 0%;
            --center-x-px: 0px;
            --center-y-pct: -50%;
            --center-y-px: -12px;
            --stack-y-offset: 40px;
          }
          .noid-card-3 {
            --center-x-pct: 0%;
            --center-x-px: 0px;
            --center-y-pct: -150%;
            --center-y-px: -36px;
            --stack-y-offset: 60px;
          }
        }

        /* Hover fanning effects */
        @media (min-width: 768px) {
          .open-container:hover .open-card-1 {
            --hover-offset-x: 35px;
            --hover-offset-r: 3.5deg;
          }
          .noid-container:hover .noid-card-1 {
            --hover-offset-x: 35px;
            --hover-offset-y: 5px;
            --hover-offset-r: 2.5deg;
          }
          .noid-container:hover .noid-card-2 {
            --hover-offset-x: 70px;
            --hover-offset-y: 10px;
            --hover-offset-r: 5deg;
          }
          .noid-container:hover .noid-card-3 {
            --hover-offset-x: 105px;
            --hover-offset-y: 15px;
            --hover-offset-r: 7.5deg;
          }
        }
        @media (max-width: 767px) {
          .open-container:hover .open-card-1 {
            --hover-offset-y: 25px;
            --hover-offset-r: 3.5deg;
          }
          .noid-container:hover .noid-card-1 {
            --hover-offset-y: 25px;
            --hover-offset-r: 2.5deg;
          }
          .noid-container:hover .noid-card-2 {
            --hover-offset-y: 50px;
            --hover-offset-r: 5deg;
          }
          .noid-container:hover .noid-card-3 {
            --hover-offset-y: 75px;
            --hover-offset-r: 7.5deg;
          }
        }

        /* Card lift on direct hover */
        .card-hover-wrapper:hover {
          --hover-lift-y: -15px;
        }
      `}</style>
    </section>
  );
}