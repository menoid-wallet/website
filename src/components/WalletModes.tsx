"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useEffect, useRef } from "react";

interface BoxProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const OPEN_MODE_BOXES = [
  {
    title: "Create Wallet",
    description: "Initialize your standard public EOA wallet to start managing your assets.",
    imageSrc: "/wallet_modes/create_wallet_2.png",
    imageAlt: "Create Wallet Screen",
  },
  {
    title: "Use the Wallet",
    description: "Transfer, swap, and interact publicly just like every other wallet.",
    imageSrc: "/wallet_modes/ship_send.png",
    imageAlt: "Use the Wallet Screen",
  },
];

const NOID_MODE_BOXES = [
  {
    title: "Hide Your Funds",
    description: "Hide and lock your funds in the Noid pool.",
    imageSrc: "/wallet_modes/mask.png",
    imageAlt: "Hide Your Funds Screen",
  },
  {
    title: "Hidden Transfer",
    description: "Transfer privately to any user.",
    imageSrc: "/wallet_modes/hidden_trasnfer_successful.png",
    imageAlt: "Hidden Transfer Screen",
  },
  {
    title: "Unhide Your Funds",
    description: "Unhide your funds to open mode any time safely.",
    imageSrc: "/wallet_modes/unmask_meno.png",
    imageAlt: "Unhide Your Funds Screen",
  },
  {
    title: "Noid Smart Accounts",
    description: "Create Noid Smart Accounts to interact with dapps privately.",
    imageSrc: "/wallet_modes/create_noid_account.png",
    imageAlt: "Noid Smart Account Screen",
  },
];

function ModeCard({ title, description, imageSrc, imageAlt }: BoxProps) {
  return (
    <div
      className="group flex flex-col justify-between overflow-hidden rounded-[24px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: "#FBF1D9", // Hero page background color
        border: "1px solid rgba(163, 110, 20, 0.18)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04), 0 1px 0 rgba(255, 255, 255, 0.9) inset",
      }}
    >
      {/* Image Container - straight picture with no background or borders */}
      <div className="relative overflow-hidden w-full aspect-[1.5/1] mb-4">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display text-[16px] sm:text-[18px] font-bold text-[var(--ink)] mb-1.5">
            {title}
          </h4>
          <p className="text-[12px] sm:text-[13px] leading-relaxed text-[var(--ink-soft)] font-light">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WalletModes() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const darkBoxRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const darkBox = darkBoxRef.current;
    const content = contentRef.current;
    if (!section || !darkBox || !content) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewHeight = window.innerHeight;

      // Skip updates if section is scrolled completely off viewport
      if (rect.bottom < 0 || rect.top > viewHeight) return;

      // Calculate progress p
      const p = (viewHeight - rect.top) / viewHeight;
      const clampedP = Math.max(0, Math.min(1, p));

      let width = 60;
      let borderRadius = 48;
      let opacity = 0;
      let y = 30;

      if (clampedP < 0.5) {
        // From 0% to 50% scrolled: width goes 60% -> 95%, border-radius goes 48px -> 20px
        const t = clampedP / 0.5;
        width = 60 + t * (95 - 60);
        borderRadius = 48 - t * (48 - 20);
        opacity = t * 0.8;
        y = 30 - t * 20;
      } else if (clampedP < 0.6) {
        // From 50% to 60% scrolled: width goes 95% -> 100%, border-radius goes 20px -> 0px
        const t = (clampedP - 0.5) / 0.1;
        width = 95 + t * (100 - 95);
        borderRadius = 20 - t * 20;
        opacity = 0.8 + t * 0.2;
        y = 10 - t * 10;
      } else {
        // Scrolled 60% or more: fully expanded
        width = 100;
        borderRadius = 0;
        opacity = 1;
        y = 0;
      }

      // Calculate gap reduction: at clampedP >= 0.6, reduce the 80px gap by 100%
      let marginTop = 0;
      if (clampedP < 0.6) {
        const t = clampedP / 0.6;
        marginTop = -t * 80; // shrink the top margin gap on scroll
      } else {
        marginTop = -80;
      }

      // Directly update DOM styles to guarantee 60fps/120fps lag-free scroll performance
      darkBox.style.width = `${width}%`;
      darkBox.style.borderRadius = `${borderRadius}px`;
      darkBox.style.marginTop = `${marginTop}px`;
      
      content.style.opacity = `${opacity}`;
      content.style.transform = `translateY(${y}px)`;
    };

    // Initialize layout on mount
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
      className="grain relative overflow-hidden py-0"
      style={{
        background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)", // Hero background
      }}
    >
      {/* Hero-like grid lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-0"
        style={{
          backgroundImage: "radial-gradient(rgba(163,110,20,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      {/* Show the divider at the very top of the section to outline difference */}
      <div
        className="mx-auto mb-20 max-w-6xl h-px relative z-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(200,146,14,0.2) 30%, rgba(200,146,14,0.2) 70%, transparent)",
        }}
      />

      {/* Centered Expanding Dark Box containing grid content */}
      <div
        ref={darkBoxRef}
        className="relative mx-auto flex justify-center overflow-hidden z-10"
        style={{
          background: "#171311",
          width: "60%",
          borderRadius: "48px",
          transition: "width 120ms cubic-bezier(0.215, 0.61, 0.355, 1), border-radius 120ms cubic-bezier(0.215, 0.61, 0.355, 1), margin-top 120ms cubic-bezier(0.215, 0.61, 0.355, 1)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
        }}
      >
        {/* Background grid layer */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{
            opacity: 0.04,
            backgroundImage: "linear-gradient(to right,#FBF1D9 1px,transparent 1px),linear-gradient(to bottom,#FBF1D9 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }} 
        />
        
        {/* Background orbs */}
        <div 
          className="absolute z-0 pointer-events-none" 
          style={{
            top: "-10%", right: "-5%", width: 350, height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,174,58,0.18) 0%, transparent 60%)",
            filter: "blur(60px)",
            animation: "noidBgOrb1 14s ease-in-out infinite",
          }} 
        />
        <div 
          className="absolute z-0 pointer-events-none" 
          style={{
            bottom: "-10%", left: "-5%", width: 320, height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,110,20,0.15) 0%, transparent 60%)",
            filter: "blur(64px)",
            animation: "noidBgOrb2 11s ease-in-out infinite 3s",
          }} 
        />

        {/* Sheen */}
        <div className="sheen absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }} />

        {/* Content Wrapper inside the dark window */}
        <div
          ref={contentRef}
          className="w-full max-w-6xl shrink-0 px-4 sm:px-6 py-28 z-10"
          style={{
            opacity: 0,
            transform: "translateY(30px)",
            transition: "opacity 180ms ease-out, transform 180ms ease-out",
          }}
        >
          {/* Header */}
          <Reveal className="text-center mb-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)] mb-3">
              ✦ Two Modes, One Wallet ✦
            </p>
            <h2
              className="font-display font-black tracking-[-0.035em] text-[#FBF1D9]"
              style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}
            >
              Sail open, or sail in the{" "}
              <em
                className="font-display font-light italic text-[#E8AE3A]"
              >
                shadow waters.
              </em>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-[14px] sm:text-[15px] leading-relaxed text-[#C9BBAA]">
              Menoid holds two accounts simultaneously. Switch seamlessly between your public EOA profile for everyday activities and your private ZK profile for shielded stealth operations.
            </p>
          </Reveal>

          {/* 6 Boxes Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            
            {/* Open Mode Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <Reveal className="mb-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1.5 border border-[rgba(255,255,255,0.08)] mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#EAD5A7] font-semibold">
                    Open Mode
                  </span>
                </div>
                <h3 className="font-display text-[22px] font-bold text-[#FBF1D9]">
                  EOA Accounts
                </h3>
                <p className="text-[13px] text-[#C9BBAA] mt-2 leading-relaxed font-light">
                  Your public profile for standard transactions, swapping, and dApp testing.
                </p>
              </Reveal>
              
              <Reveal delay={100} className="grid grid-cols-1 gap-6">
                {OPEN_MODE_BOXES.map((box) => (
                  <ModeCard key={box.title} {...box} />
                ))}
              </Reveal>
            </div>

            {/* Noid Mode Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Reveal className="mb-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(232,174,58,0.12)] px-3 py-1.5 border border-[rgba(232,174,58,0.22)] mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] pulse-dot" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] font-semibold">
                    Noid Mode
                  </span>
                </div>
                <h3 className="font-display text-[22px] font-bold text-[#FBF1D9]">
                  ZK Shielded Accounts
                </h3>
                <p className="text-[13px] text-[#C9BBAA] mt-2 leading-relaxed font-light">
                  Your private workspace. Shield funds, execute stealth transfers, and transact completely unseen.
                </p>
              </Reveal>
              
              <Reveal delay={150} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {NOID_MODE_BOXES.map((box) => (
                  <ModeCard key={box.title} {...box} />
                ))}
              </Reveal>
            </div>

          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes noidBgOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 25px) scale(1.12); }
        }
        @keyframes noidBgOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.15); }
        }
      `}</style>
    </section>
  );
}
