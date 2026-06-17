"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useEffect, useRef, useState } from "react";

interface Bullet {
  icon: string;
  text: string;
}
interface Phase {
  version: string;
  tagline: string;
  bullets: Bullet[];
  cohorts?: string[];
  locked?: boolean;
}

const PHASES: Phase[] = [
  {
    version: "V1",
    tagline: "Private Beta · Stay Tuned",
    bullets: [
      { icon: "🌐", text: "6 testnets — Monad, Sepolia, Base, Solana, Sui & Aptos." },
      { icon: "🤖", text: "Minimalistic Meno — Meno Chat + Co-Pilot mode for a single dApp." },
      { icon: "🎯", text: "Target: 1,000 crypto user reviews." },
      { icon: "🎁", text: "Rewards distributed to the 1,000 reviewers after the stable launch." },
    ],
    cohorts: [
      "V1 Private Beta (Extension)",
      "V1 Open Beta (Extension)",
      "V1 Mobile Beta (iOS & Android)",
    ],
  },
  {
    version: "V2",
    tagline: "Sealed Orders",
    locked: true,
    bullets: [
      { icon: "⛓️", text: "20+ mainnet networks, shielded end to end." },
      { icon: "🧠", text: "Multi-dApp AutoPilot running across tabs at once." },
      { icon: "🔐", text: "Shielded pool v2 with instant client-side proofs." },
      { icon: "🤝", text: "Private cross-chain bridges with hidden routing." },
    ],
  },
  {
    version: "V3",
    tagline: "Sealed Orders",
    locked: true,
    bullets: [
      { icon: "🌍", text: "Universal chain abstraction — one balance, every chain." },
      { icon: "🪄", text: "Autonomous on-chain agents executing your strategies." },
      { icon: "🏦", text: "Institutional-grade private treasury suite." },
      { icon: "🛡️", text: "Zero-knowledge identity & reputation layer." },
    ],
  },
];

const Lock = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function CardInner({ phase }: { phase: Phase }) {
  const current = !phase.locked;
  return (
    <>
      {/* header */}
      <div className="rm-head">
        <span className="rm-num">{phase.version}</span>
        <span className="rm-htitle">{phase.tagline}</span>
        <span className="rm-corner" aria-hidden />
      </div>

      <div className="rm-divider" />

      {/* collapsible body */}
      <div className="rm-bodywrap">
        <div className="rm-body">
          <div className="rm-body-inner">
            {current ? (
              <>
                <ul className="rm-bullets">
                  {phase.bullets.map((b) => (
                    <li key={b.text}>
                      <span className="rm-emoji">{b.icon}</span>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
                {phase.cohorts && (
                  <div className="rm-cohorts">
                    <p className="rm-cohorts-label">Rollout Cohorts</p>
                    <ul>
                      {phase.cohorts.map((c, i) => (
                        <li key={c}>
                          <span className="rm-cohort-num">{i + 1}</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="rm-locked">
                <ul className="rm-bullets rm-blurred">
                  {phase.bullets.map((b) => (
                    <li key={b.text}>
                      <span className="rm-emoji">{b.icon}</span>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="rm-locked-overlay">
                  <span className="rm-lock-badge">
                    <Lock size={22} />
                  </span>
                  <span className="rm-coming">Coming Soon</span>
                  <span className="rm-coming-sub">Charted in shadow</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rm-divider" />

      {/* footer */}
      <div className="rm-foot">
        <span className="rm-foot-icon">
          <Image src="/meno-hat.png" alt="" width={18} height={18} className="object-contain" />
        </span>
        <span className="rm-foot-name">Menoid {phase.version}</span>
        {current ? (
          <span className="rm-status rm-status-here">
            <span className="pulse-dot rm-dot" />
            You are here
          </span>
        ) : (
          <span className="rm-status rm-status-lock">
            <Lock size={11} />
            Sealed
          </span>
        )}
      </div>
    </>
  );
}

function TimelineRow({ phase, index }: { phase: Phase; index: number }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const side = index % 2 === 0 ? "right" : "left";

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOpen(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "-10% 0px -50% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className={`rm-row rm-${side} ${open ? "is-open" : ""}`}
      style={{ transitionDelay: open ? "0ms" : undefined }}
    >
      <span className="rm-node" aria-hidden />
      <span className="rm-conn" aria-hidden />
      <div className="rm-card">
        <CardInner phase={phase} />
      </div>
    </div>
  );
}

export default function Roadmap() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!track || !fill) return;
      const r = track.getBoundingClientRect();
      const centerY = window.innerHeight * 0.5;
      const h = Math.max(0, Math.min(r.height, centerY - r.top));
      fill.style.height = `${h}px`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="roadmap" className="grain relative overflow-hidden" style={{ background: "#171311" }}>
      {/* grid blueprint */}
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
          top: "4%",
          right: "-5%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,241,217,0.16) 0%, transparent 60%)",
          filter: "blur(64px)",
          animation: "roadmapOrb1 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          bottom: "6%",
          left: "-5%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,241,217,0.15) 0%, transparent 60%)",
          filter: "blur(64px)",
          animation: "roadmapOrb2 11s ease-in-out infinite 3s",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-24 md:py-28">
        <div
          className="mx-auto mb-14 h-px max-w-3xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(251,241,217,0.25) 30%, rgba(251,241,217,0.25) 70%, transparent)",
          }}
        />

        <Reveal className="mb-16 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-[#FBF1D9]">
            ✦ The Voyage Ahead ✦
          </p>
          <h2
            className="font-display font-black tracking-[-0.035em] text-[#FBF1D9]"
            style={{ fontSize: "clamp(30px, 4.5vw, 54px)" }}
          >
            Roadmap
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] sm:text-[15px] leading-relaxed text-[#C9BBAA]">
            Three chapters chart the journey.{" "}
            <span className="font-semibold text-[#FBF1D9]">Stay tuned</span> for the V1
            private beta — the rest stay sealed beneath the waterline.
          </p>
        </Reveal>

        {/* timeline */}
        <div ref={trackRef} className="rm-tl">
          <div className="rm-line" aria-hidden />
          <div ref={fillRef} className="rm-fill" aria-hidden>
            <span className="rm-anchor">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="5" r="3" />
                <line x1="12" y1="22" x2="12" y2="8" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
              </svg>
            </span>
          </div>
          {PHASES.map((phase, i) => (
            <TimelineRow key={phase.version} phase={phase} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes roadmapOrb1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-26px,22px) scale(1.12); } }
        @keyframes roadmapOrb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(34px,-26px) scale(1.15); } }

        .rm-tl { position: relative; padding-top: 22vh; }

        /* central timeline line + scroll-driven gold fill */
        .rm-line {
          position: absolute; top: 0; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; border-left: 1px dashed rgba(251,241,217,0.22);
        }
        .rm-fill {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 2px; height: 0; border-radius: 2px;
          background: linear-gradient(180deg, rgba(251,241,217,0.95), rgba(251,241,217,0.45));
          box-shadow: 0 0 14px rgba(251,241,217,0.55);
        }
        .rm-anchor {
          position: absolute; left: 50%; bottom: -17px; transform: translateX(-50%);
          color: #FBF1D9; z-index: 5; pointer-events: none; line-height: 0;
          filter: drop-shadow(0 0 8px rgba(251,241,217,0.7));
          animation: rmAnchorShine 2.6s ease-in-out infinite;
        }
        @keyframes rmAnchorShine {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(251,241,217,0.45)); }
          50%      { filter: drop-shadow(0 0 15px rgba(251,241,217,1)); }
        }

        .rm-row { position: relative; display: flex; padding: 26px 0; }
        .rm-right { justify-content: flex-end; }
        .rm-left { justify-content: flex-start; }

        /* node on the line + connector */
        .rm-node {
          position: absolute; top: 30px; left: 50%; transform: translate(-50%, -50%);
          width: 13px; height: 13px; border-radius: 3px; z-index: 3;
          background: #1d1714; border: 1px solid rgba(251,241,217,0.45);
          transition: background .5s var(--ease-out-quart), border-color .5s, box-shadow .5s, transform .5s var(--ease-spring);
        }
        .rm-row.is-open .rm-node {
          background: #FBF1D9; border-color: #FBF1D9;
          box-shadow: 0 0 16px rgba(251,241,217,0.75); transform: translate(-50%, -50%) scale(1.15);
        }
        .rm-conn {
          position: absolute; top: 30px; height: 1px; width: 5%;
          border-top: 1px dashed rgba(251,241,217,0.3);
          opacity: 0; transition: opacity .6s ease .1s;
        }
        .rm-row.is-open .rm-conn { opacity: 1; }
        .rm-right .rm-conn { left: 50%; }
        .rm-left .rm-conn { right: 50%; }

        /* card */
        .rm-card {
          position: relative; width: 45%; border-radius: 18px; overflow: hidden;
          border: 1px solid rgba(251,241,217,0.16);
          background: linear-gradient(160deg, rgba(44,36,29,0.65) 0%, rgba(23,19,17,0.72) 100%);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 18px 44px rgba(0,0,0,0.40);
          opacity: 0; transform: translateY(26px) scale(0.985);
          transition: opacity .7s var(--ease-out-quart), transform .8s var(--ease-out-quart),
                      border-color .7s, box-shadow .7s;
          will-change: transform, opacity;
        }
        .rm-row.is-open .rm-card {
          opacity: 1; transform: translateY(0) scale(1);
          border-color: rgba(251,241,217,0.38);
          box-shadow: 0 28px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,241,217,0.14), 0 0 40px rgba(251,241,217,0.10);
        }

        /* scan-line sweep on open */
        .rm-card::after {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 4;
          background: linear-gradient(180deg, transparent 0%, rgba(251,241,217,0.16) 50%, transparent 100%);
          transform: translateY(-110%); opacity: 0;
        }
        .rm-row.is-open .rm-card::after { animation: rmScan 1s var(--ease-out-quart) .15s 1; }
        @keyframes rmScan { 0% { transform: translateY(-110%); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(110%); opacity: 0; } }

        .rm-head { display: flex; align-items: center; gap: 12px; padding: 15px 18px; }
        .rm-num {
          font-family: var(--font-geist-mono), monospace; font-size: 14px; font-weight: 700;
          color: #FBF1D9; line-height: 1; padding: 5px 9px; border-radius: 7px;
          border: 1px solid rgba(251,241,217,0.4); background: rgba(251,241,217,0.06);
        }
        .rm-htitle {
          font-family: var(--font-geist-mono), monospace; font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase; color: #C9BBAA; white-space: nowrap;
        }
        .rm-corner { margin-left: auto; width: 7px; height: 7px; border-top: 1px solid rgba(251,241,217,0.4); border-right: 1px solid rgba(251,241,217,0.4); }

        .rm-divider { height: 1px; background: rgba(251,241,217,0.12); }

        .rm-bodywrap {
          display: grid; grid-template-rows: 0fr; opacity: 0;
          transition: grid-template-rows .72s var(--ease-out-quart), opacity .55s ease .1s;
        }
        .rm-row.is-open .rm-bodywrap { grid-template-rows: 1fr; opacity: 1; }
        .rm-body { overflow: hidden; min-height: 0; }
        .rm-body-inner { padding: 16px 18px 18px; }

        .rm-bullets { display: flex; flex-direction: column; gap: 11px; }
        .rm-bullets li { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; line-height: 1.5; color: #D2C6B5; font-weight: 300; }
        .rm-emoji { flex-shrink: 0; font-size: 15px; line-height: 1.3; }

        .rm-cohorts { margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(251,241,217,0.14); }
        .rm-cohorts-label { font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: #FBF1D9; margin-bottom: 10px; }
        .rm-cohorts ul { display: flex; flex-direction: column; gap: 8px; }
        .rm-cohorts li { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #EADfce; font-weight: 500; }
        .rm-cohort-num { flex-shrink: 0; display: grid; place-items: center; width: 19px; height: 19px; border-radius: 50%; font-size: 10px; font-weight: 700; color: #171311; background: linear-gradient(180deg, #FBF1D9, #FBF1D9); }

        /* locked body */
        .rm-locked { position: relative; }
        .rm-blurred { filter: blur(6px); opacity: 0.45; user-select: none; pointer-events: none; }
        .rm-locked-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; text-align: center; }
        .rm-lock-badge { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; color: #FBF1D9; background: rgba(23,19,17,0.5); border: 1px solid rgba(251,241,217,0.35); backdrop-filter: blur(2px); }
        .rm-coming { font-family: var(--font-display), sans-serif; font-size: 19px; font-weight: 800; color: #FBF1D9; letter-spacing: -0.02em; }
        .rm-coming-sub { font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #FBF1D9; }

        .rm-foot { display: flex; align-items: center; gap: 10px; padding: 13px 18px; }
        .rm-foot-icon { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(135deg,#FBF1D9,#F4E7CC); box-shadow: 0 0 0 1px rgba(251,241,217,0.25); flex-shrink: 0; }
        .rm-foot-name { font-family: var(--font-geist-mono), monospace; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: #C9BBAA; }
        .rm-status { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-family: var(--font-geist-mono), monospace; font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 5px 10px; border-radius: 999px; }
        .rm-status-here { background: #FBF1D9; color: #171311; }
        .rm-status-here .rm-dot { width: 6px; height: 6px; border-radius: 50%; background: #171311; }
        .rm-status-lock { background: rgba(251,241,217,0.08); border: 1px solid rgba(251,241,217,0.28); color: #C9BBAA; }

        /* ---- mobile: line on the left, all cards to the right ---- */
        @media (max-width: 767px) {
          .rm-line, .rm-fill { left: 16px; }
          .rm-row, .rm-right, .rm-left { justify-content: flex-end; }
          .rm-card { width: calc(100% - 44px); }
          .rm-node { left: 16px; }
          .rm-conn, .rm-right .rm-conn, .rm-left .rm-conn { left: 16px; right: auto; width: 28px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .rm-card, .rm-bodywrap, .rm-node { transition: none; }
          .rm-row.is-open .rm-card::after { animation: none; }
        }
      `}</style>
    </section>
  );
}
