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

/* Dark, transparent-glass feature card (matches the Noid-mode panels). */
function FeatureCard({ index, kicker, title, intro, points }: FeatureCardData) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[26px] p-6 md:p-8"
      style={{
        background: "linear-gradient(150deg, rgba(34,28,23,0.86) 0%, rgba(20,16,14,0.84) 100%)",
        border: "1px solid rgba(232,174,58,0.16)",
        boxShadow: "0 30px 70px rgba(23,19,17,0.30), 0 1px 0 rgba(255,255,255,0.05) inset",
        backdropFilter: "blur(22px) saturate(120%)",
        WebkitBackdropFilter: "blur(22px) saturate(120%)",
      }}
    >
      {/* glass grid + glow */}
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
  const welcomeRef = useRef<HTMLDivElement | null>(null);
  const thinkRef = useRef<HTMLDivElement | null>(null);
  const meetRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);

  // Part 2 ref
  const part2HeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight;

      /* ── Part 1: pinned cinematic sequence ── */
      const wrap = part1Ref.current;
      if (wrap) {
        const r = wrap.getBoundingClientRect();
        const total = Math.max(r.height - vh, 1);
        const p = clamp(-r.top / total, 0, 1);

        if (welcomeRef.current) {
          const out = seg(p, 0.12, 0.22);
          welcomeRef.current.style.opacity = `${1 - out}`;
          welcomeRef.current.style.transform = `translateY(${-out * 70}px) scale(${lerp(1, 0.92, out)})`;
        }
        if (thinkRef.current) {
          const inn = seg(p, 0.2, 0.3);
          const out = seg(p, 0.44, 0.54);
          thinkRef.current.style.opacity = `${clamp(inn - out, 0, 1)}`;
          thinkRef.current.style.transform = `translateY(${lerp(50, 0, inn) - out * 60}px) scale(${lerp(0.95, 1, inn)})`;
        }
        if (meetRef.current) {
          const inn = seg(p, 0.52, 0.62);
          const out = seg(p, 0.8, 0.92);
          meetRef.current.style.opacity = `${clamp(inn - out, 0, 1)}`;
          meetRef.current.style.transform = `translateY(${lerp(50, 0, inn) - out * 50}px) scale(${lerp(0.92, 1, inn) * lerp(1, 0.72, out)})`;
        }
        if (finalRef.current) {
          const inn = seg(p, 0.82, 1.0);
          finalRef.current.style.opacity = `${inn}`;
          finalRef.current.style.transform = `translateY(${lerp(44, 0, inn)}px)`;
          finalRef.current.style.pointerEvents = inn > 0.5 ? "auto" : "none";
        }
      }

      /* ── Part 2: heading "appears big, settles to its position" ── */
      const h = part2HeadingRef.current;
      if (h) {
        const r = h.getBoundingClientRect();
        const hp = clamp((vh * 0.82 - r.top) / (vh * 0.82 - vh * 0.24), 0, 1);
        h.style.transform = `scale(${lerp(1.22, 1, hp)})`;
        h.style.opacity = `${clamp(0.3 + hp, 0, 1)}`;
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

  const bigText =
    "font-display font-black tracking-[-0.04em] text-[var(--ink)] leading-[1.02]";

  return (
    <section
      id="meno"
      className="grain relative"
      style={{ background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)" }}
    >
      {/* Decorative clip layer — keeps the section overflow-visible so the
          sticky pins work, while clipping the glows/grid/sheen to the section. */}
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
            top: "44%",
            right: "-6%",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,110,20,0.14) 0%, transparent 60%)",
            filter: "blur(64px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "4%",
            left: "8%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,174,58,0.12) 0%, transparent 60%)",
            filter: "blur(64px)",
          }}
        />
      </div>

      {/* ════════════════════ PART 1 — pinned intro ════════════════════ */}
      <div ref={part1Ref} className="relative z-10" style={{ height: "300vh" }}>
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* Stage 1 — Let's welcome the hero product */}
          <div
            ref={welcomeRef}
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{ opacity: 1, transition: "opacity 90ms linear, transform 90ms linear" }}
          >
            <h2 className={bigText} style={{ fontSize: "clamp(34px, 7vw, 104px)" }}>
              Let&apos;s welcome the{" "}
              <em className="font-display font-light italic text-[var(--gold-deep)]">hero product.</em>
            </h2>
          </div>

          {/* Stage 2 — What if your wallet could think? */}
          <div
            ref={thinkRef}
            className="absolute inset-0 flex items-center justify-center px-6 text-center"
            style={{ opacity: 0, transition: "opacity 90ms linear, transform 90ms linear" }}
          >
            <h2 className={bigText} style={{ fontSize: "clamp(34px, 7.2vw, 110px)" }}>
              What if your wallet could{" "}
              <em className="font-display font-light italic text-[var(--gold-deep)] shimmer-gold">think?</em>
            </h2>
          </div>

          {/* Stage 3 — Meet Meno (big) */}
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

          {/* Stage 4 — settled two-column hero */}
          <div
            ref={finalRef}
            className="absolute inset-0 flex items-center"
            style={{ opacity: 0, transition: "opacity 120ms linear, transform 120ms linear" }}
          >
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
              {/* Meno picture (left) */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative h-[clamp(220px,34vw,420px)] w-[clamp(220px,34vw,420px)] gentle-bob">
                  <Image
                    src="/meno/meno_hi.png"
                    alt="Meet Meno"
                    fill
                    sizes="(max-width: 1024px) 60vw, 420px"
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
                  style={{ fontSize: "clamp(30px, 4.6vw, 60px)" }}
                >
                  What if your wallet could{" "}
                  <em className="font-display font-light italic text-[var(--gold-deep)]">think?</em>
                </h2>
                <p
                  className="mt-4 font-display font-black tracking-[-0.03em] text-[var(--ink)]"
                  style={{ fontSize: "clamp(26px, 3.4vw, 44px)" }}
                >
                  Meet{" "}
                  <em className="font-display font-light italic text-[var(--gold-deep)] shimmer-gold">Meno.</em>
                </p>
                <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[var(--ink-soft)] lg:mx-0">
                  An AI-native private wallet companion that thinks alongside you — guiding every
                  move you make onchain.
                </p>
              </div>
            </div>
          </div>

          {/* scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
              Scroll
            </span>
            <span className="h-6 w-px bg-[rgba(163,110,20,0.4)] scroll-hint" />
          </div>
        </div>
      </div>

      {/* ════════════════════ PART 2 — stale wallet ════════════════════ */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-28 pt-[8vh]">
        {/* Top divider */}
        <div
          className="mx-auto mb-14 h-px max-w-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(163,110,20,0.22) 30%, rgba(163,110,20,0.22) 70%, transparent)",
          }}
        />

        {/* Heading (appears big, settles into place) */}
        <div className="mb-14 max-w-3xl">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold-deep)]">
            ✦ The Stale Wallet Problem ✦
          </p>
          <h2
            ref={part2HeadingRef}
            className="font-display font-black tracking-[-0.035em] text-[var(--ink)] leading-[1.05]"
            style={{
              fontSize: "clamp(30px, 4.6vw, 58px)",
              transformOrigin: "left center",
              opacity: 1,
              transition: "opacity 90ms linear, transform 90ms linear",
            }}
          >
            Say Goodbye to the{" "}
            <em className="font-display font-light italic text-[var(--gold-deep)]">Stale Wallet</em>{" "}
            Pop-Up
          </h2>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[var(--ink-soft)]">
            {STALE_DESCRIPTION}
          </p>
        </div>

        {/* Fixed image (left) + scrolling feature cards (right) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left — sticky image */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[16vh]">
              <div
                className="relative aspect-square w-full overflow-hidden rounded-[28px]"
                style={{
                  border: "1px solid rgba(163,110,20,0.22)",
                  boxShadow:
                    "0 30px 70px rgba(23,19,17,0.18), 0 8px 20px rgba(23,19,17,0.10), 0 1px 0 rgba(255,255,255,0.7) inset",
                }}
              >
                <Image
                  src="/wallet/walletpic.png"
                  alt="A wallet locked away, stale on the sand"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent 55%, rgba(23,19,17,0.28))" }}
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

          {/* Right — scrolling cards */}
          <div className="flex flex-col gap-8 lg:col-span-7">
            {FEATURE_CARDS.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
