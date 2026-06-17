"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────────────
   Helpers for scroll-driven choreography
   ────────────────────────────────────────────────────────────── */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
// linear 0→1 across [a, b]
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ──────────────────────────────────────────────────────────────
   Part 2 — feature card content
   ────────────────────────────────────────────────────────────── */
interface FeaturePoint {
  label: string;
  text: string;
}
interface FeatureCardData {
  index: string;
  kicker: string;
  title: string;
  intro: string;
  points: FeaturePoint[];
}

const FEATURE_CARDS: FeatureCardData[] = [
  {
    index: "01",
    kicker: "Live Assist",
    title: "Co-Piloting",
    intro:
      "Stop copying, pasting, and guessing. Meno tracks your live dApp interactions in real-time right from your sidebar.",
    points: [
      {
        label: "Dynamic Form Optimization",
        text:
          "As you type an NFT name or description into a dApp field, Meno evaluates the inputs locally, suggesting optimized, stylish copywriting improvements on the fly.",
      },
      {
        label: "Proactive Risk & Simulation",
        text:
          "Meno runs predictive simulations alongside your typing, warning you of smart contract risks or high gas conditions before you ever click a button.",
      },
    ],
  },
  {
    index: "02",
    kicker: "Autopilot",
    title: "Automation",
    intro:
      "Don't fight confusing user interfaces on unfamiliar dApps. Let Meno pilot the web page for you using simple natural language commands.",
    points: [
      {
        label: "Hands-Free DApp Navigation",
        text:
          'Type a macro prompt like "Hey Meno, I\'m new to this marketplace—mint an NFT and list it for 4 SOL."',
      },
      {
        label: "Autonomous Execution",
        text:
          "Meno securely reads the webpage's DOM elements, programmatically establishes the wallet handshake, handles form fields, and executes the target transaction flow seamlessly—no manual clicks required.",
      },
    ],
  },
];

const STALE_DESCRIPTION =
  "Traditional Web3 wallets are silent signature signers—blind to what you are doing until the final confirmation screen. Meno transforms your browser sidebar from a stagnant ledger into a proactive, intelligent Web3 console.";

/* Solid dark feature card (matched in size to the wallet image). */
function FeatureCard({ index, kicker, title, intro, points }: FeatureCardData) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[26px] p-6 md:p-8 lg:flex lg:min-h-[520px] lg:flex-col lg:justify-center"
      style={{
        background: "linear-gradient(150deg, #221c17 0%, #14100e 100%)",
        border: "1px solid rgba(232,174,58,0.18)",
        boxShadow: "0 26px 60px rgba(23,19,17,0.28), 0 1px 0 rgba(255,255,255,0.05) inset",
      }}
    >
      {/* subtle grid + glow */}
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
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,174,58,0.16) 0%, transparent 62%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="font-mono text-[13px] font-semibold tracking-[0.2em] text-[var(--gold-bright)]">
            {index}
          </span>
          <span
            className="h-px flex-1"
            style={{ background: "linear-gradient(90deg, rgba(232,174,58,0.45), rgba(232,174,58,0.05))" }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#9b8a73]">
            {kicker}
          </span>
        </div>

        <h3
          className="font-display font-black tracking-[-0.02em] text-[#FBF1D9]"
          style={{ fontSize: "clamp(24px, 2.6vw, 34px)" }}
        >
          {title}
        </h3>

        <p className="mt-3 text-[14px] md:text-[15px] font-light leading-relaxed text-[#C9BBAA]">
          {intro}
        </p>

        <ul className="mt-6 space-y-5">
          {points.map((pt) => (
            <li key={pt.label} className="relative pl-5">
              <span className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full bg-[var(--gold-bright)]" />
              <p className="text-[14px] md:text-[15px] leading-relaxed text-[#D8CCBA]">
                <span className="font-semibold text-[#FBF1D9]">{pt.label}:</span>{" "}
                <span className="font-light">{pt.text}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MenoSection() {
  // Part 1 refs
  const part1Ref = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const meetRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);

  // Part 2 refs
  const part2HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const imageCardRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight;

      /* ── Part 1: pinned cinematic sequence ── */
      const wrap = part1Ref.current;
      if (wrap) {
        const r = wrap.getBoundingClientRect();
        const total = Math.max(r.height - vh, 1);
        const p = clamp(-r.top / total, 0, 1);

        // Stage 1 — "Let's welcome…" + "What if your wallet could think?" (together)
        if (introRef.current) {
          const out = seg(p, 0.28, 0.42);
          introRef.current.style.opacity = `${1 - out}`;
          introRef.current.style.transform = `translateY(${-out * 70}px)`;
        }
        // Stage 2 — "Meet Meno" (big)
        if (meetRef.current) {
          const inn = seg(p, 0.38, 0.5);
          const out = seg(p, 0.72, 0.86);
          meetRef.current.style.opacity = `${clamp(inn - out, 0, 1)}`;
          meetRef.current.style.transform = `translateY(${lerp(50, 0, inn) - out * 50}px) scale(${lerp(0.9, 1, inn) * lerp(1, 0.72, out)})`;
        }
        // Stage 3 — settled two-column hero
        if (finalRef.current) {
          const inn = seg(p, 0.8, 1.0);
          finalRef.current.style.opacity = `${inn}`;
          finalRef.current.style.transform = `translateY(${lerp(44, 0, inn)}px)`;
          finalRef.current.style.pointerEvents = inn > 0.5 ? "auto" : "none";
        }
      }

      /* ── Part 2: heading "appears big, settles to its position" (desktop only) ── */
      const h = part2HeadingRef.current;
      if (h) {
        const r = h.getBoundingClientRect();
        const hp = clamp((vh * 0.82 - r.top) / (vh * 0.82 - vh * 0.24), 0, 1);
        const isDesktop = window.innerWidth >= 1024;
        h.style.transform = isDesktop ? `scale(${lerp(1.18, 1, hp)})` : "none";
        h.style.opacity = `${clamp(0.35 + hp, 0, 1)}`;
      }

      /* ── Part 2 (mobile): fade the wallet image out as cards scroll over it ── */
      const imgCard = imageCardRef.current;
      const cards = cardsRef.current;
      if (imgCard && cards) {
        if (window.innerWidth < 1024) {
          const ir = imgCard.getBoundingClientRect();
          const cardsTop = cards.getBoundingClientRect().top;
          // 0 when cards reach the image's bottom, 1 when they cover its top
          const t = clamp((ir.bottom - cardsTop) / Math.max(ir.height, 1), 0, 1);
          imgCard.style.opacity = `${1 - t}`;
        } else {
          imgCard.style.opacity = "1";
        }
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

  const bigText = "font-display font-black tracking-[-0.04em] text-[var(--ink)] leading-[1.02]";

  return (
    <section
      id="meno"
      className="grain relative"
      style={{ background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)" }}
    >
      {/* Decorative clip layer — keeps the section overflow-visible so the
          sticky pins work, while clipping the glows/grid to the section. */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px, 24px 24px",
            maskImage: "radial-gradient(ellipse 60% 40% at 50% 30%, black 40%, transparent 85%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "6%",
            left: "-5%",
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,174,58,0.16) 0%, transparent 60%)",
            filter: "blur(64px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "46%",
            right: "-6%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,110,20,0.14) 0%, transparent 60%)",
            filter: "blur(64px)",
          }}
        />
      </div>

      {/* ════════════════════ PART 1 — pinned intro ════════════════════ */}
      <div ref={part1Ref} className="relative z-10" style={{ height: "300vh" }}>
        <div className="sticky top-0 flex h-dvh min-h-[560px] items-center justify-center overflow-hidden">
          {/* Stage 1 — small "Let's welcome…" (upper) + big "What if…think?" */}
          <div ref={introRef} className="absolute inset-0 px-6" style={{ opacity: 1, transition: "opacity 90ms linear, transform 90ms linear" }}>
            <p
              className="absolute left-1/2 top-[20%] w-full -translate-x-1/2 px-6 text-center font-display font-semibold text-[var(--ink-soft)]"
              style={{ fontSize: "clamp(15px, 2.4vw, 26px)" }}
            >
              Let&apos;s welcome the hero product.
            </p>
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <h2 className={bigText} style={{ fontSize: "clamp(34px, 7.4vw, 112px)" }}>
                What if your wallet could{" "}
                <em className="font-display font-light italic text-[var(--gold-deep)] shimmer-gold">think?</em>
              </h2>
            </div>
          </div>

          {/* Stage 2 — Meet Meno (big) */}
          <div
            ref={meetRef}
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{ opacity: 0, transition: "opacity 90ms linear, transform 90ms linear" }}
          >
            <h2 className={bigText} style={{ fontSize: "clamp(46px, 11vw, 168px)" }}>
              Meet{" "}
              <em className="font-display font-light italic text-[var(--gold-deep)] shimmer-gold">Meno</em>
            </h2>
          </div>

          {/* Stage 3 — settled two-column hero */}
          <div
            ref={finalRef}
            className="absolute inset-0 flex items-center"
            style={{ opacity: 0, transition: "opacity 120ms linear, transform 120ms linear" }}
          >
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
              {/* Meno picture (left) */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative h-[clamp(180px,38vw,400px)] w-[clamp(180px,38vw,400px)] gentle-bob">
                  <Image
                    src="/meno/meno_hi.png"
                    alt="Meet Meno"
                    fill
                    sizes="(max-width: 1024px) 55vw, 400px"
                    className="object-contain drop-shadow-[0_24px_40px_rgba(163,110,20,0.30)]"
                    priority
                  />
                </div>
              </div>

              {/* Headings (right) */}
              <div className="text-center lg:text-left">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold-deep)]">
                  ✦ Your onchain companion ✦
                </p>
                <h2
                  className="font-display font-black tracking-[-0.035em] text-[var(--ink)] leading-[1.05]"
                  style={{ fontSize: "clamp(28px, 4.6vw, 58px)" }}
                >
                  What if your wallet could{" "}
                  <em className="font-display font-light italic text-[var(--gold-deep)]">think?</em>
                </h2>
                <p
                  className="mt-3 font-display font-black tracking-[-0.03em] text-[var(--ink)]"
                  style={{ fontSize: "clamp(24px, 3.4vw, 44px)" }}
                >
                  Meet{" "}
                  <em className="font-display font-light italic text-[var(--gold-deep)] shimmer-gold">Meno.</em>
                </p>
                <p className="mx-auto mt-4 max-w-md text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink-soft)] lg:mx-0">
                  An AI-native private wallet companion that thinks alongside you — guiding every
                  move you make onchain.
                </p>
              </div>
            </div>
          </div>

          {/* scroll hint */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Scroll</span>
            <span className="scroll-hint h-6 w-px bg-[rgba(163,110,20,0.4)]" />
          </div>
        </div>
      </div>

      {/* ════════════════════ PART 2 — stale wallet ════════════════════ */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-28 pt-[6vh]">
        {/* Top divider */}
        <div
          className="mx-auto mb-12 h-px max-w-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(163,110,20,0.22) 30%, rgba(163,110,20,0.22) 70%, transparent)",
          }}
        />

        {/* Heading + description */}
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold-deep)]">
            ✦ The Stale Wallet Problem ✦
          </p>
          <h2
            ref={part2HeadingRef}
            className="font-display font-black tracking-[-0.035em] text-[var(--ink)] leading-[1.05]"
            style={{
              fontSize: "clamp(28px, 4.6vw, 58px)",
              transformOrigin: "left center",
              opacity: 1,
              transition: "opacity 90ms linear, transform 90ms linear",
            }}
          >
            Say Goodbye to the{" "}
            <em className="font-display font-light italic text-[var(--gold-deep)]">Stale Wallet</em>{" "}
            Pop-Up
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] sm:text-[16px] leading-relaxed text-[var(--ink-soft)]">
            {STALE_DESCRIPTION}
          </p>
        </div>

        {/* Fixed image (left) + scrolling feature cards (right).
            `contents` on mobile lets the sticky image pin against the whole
            block (image stays, cards rise over it); on desktop they become a
            two-column grid where the left column stretches so the image sticks. */}
        <div className="relative lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Left — sticky image */}
          <div className="contents lg:block">
            <div className="sticky top-[84px] z-0 mb-8 lg:top-[14vh] lg:mb-0">
              <div
                ref={imageCardRef}
                className="relative h-[280px] w-full overflow-hidden rounded-[28px] sm:h-[340px] lg:h-[520px]"
                style={{
                  border: "1px solid rgba(163,110,20,0.22)",
                  boxShadow:
                    "0 30px 70px rgba(23,19,17,0.18), 0 8px 20px rgba(23,19,17,0.10), 0 1px 0 rgba(255,255,255,0.7) inset",
                  transition: "opacity 120ms linear",
                }}
              >
                <Image
                  src="/wallet/walletpic.png"
                  alt="A wallet locked away, stale on the sand"
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent 52%, rgba(23,19,17,0.34))" }}
                />
                <div className="absolute bottom-5 left-6 right-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FBF1D9]/80">
                    Old wallets just sit and wait
                  </p>
                  <p className="mt-1 font-display text-[20px] font-bold text-[#FBF1D9]">
                    Meno makes yours think.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — scrolling cards (solid, rise over the image on mobile) */}
          <div className="contents lg:block">
            <div ref={cardsRef} className="relative z-10 flex flex-col gap-8">
              {FEATURE_CARDS.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
