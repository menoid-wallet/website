"use client";

import Reveal from "./Reveal";
import AnimatedLogo from "./AnimatedLogo";
import WaitlistCTA from "./WaitlistCTA";
import { RainFar, RainNear, RainStyles } from "./Rain";
import { CHAINS_SEAM, ROADMAP_SEAM } from "./seams";
import { q } from "./quantise";
import { useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   ROADMAP — under the weather.
   The sky the page has been climbing through finally closes over:
   an overcast ceiling hangs from the top of the section, rain
   falls out of it, and the three phases hang off a lit thread
   running down the middle. The waitlist closes the same section,
   in the same rain, rather than starting a page of its own.
   ──────────────────────────────────────────────────────────── */

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
    tagline: " · Stay Tuned",
    bullets: [
      { icon: "🌐", text: "6 testnets — Monad, Sepolia, Base, Solana, Sui & Aptos." },
      { icon: "🎯", text: "Target: 1,000 crypto user reviews." },
      { icon: "🎁", text: "Rewards distributed to the 1,000 reviewers after the stable launch." },
    ],
    cohorts: [
      "V1 Early Beta (Web & Extension)",
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

/* the marker riding the tip of the lit thread */
const Droplet = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.4c3.6 4.4 6.6 8.2 6.6 11.6a6.6 6.6 0 0 1-13.2 0C5.4 10.6 8.4 6.8 12 2.4z" />
  </svg>
);

/* ── the overcast ceiling ──
   A deck welded to a row of puffs, drawn the same way as the hero's bank and
   then flipped in CSS: the deck ends up along the top of the section and the
   puffs hang below it. Because the flip happens after the paint, the gradient's
   *last* stop is the colour of the section's top row — it has to match what the
   section above bottoms out on, or a line appears between them.

   Not the hero's cloud shapes: those are cumulus, high in the middle and
   tapering at the ends, and upside down they read as a mountain range. An
   overcast ceiling wants an even row of bellies instead, which is what a single
   line of similar circles gives. */
/* Few and large — at a dozen-plus puffs across the strip the underside reads as
   a decorative wavy border rather than cloud. One even row of circles is not
   enough on its own either: where two equal circles meet they leave a sharp
   cusp, and a row of those reads as scalloped curtain. So a second, smaller row
   is tucked between them at a different depth, which breaks every cusp and
   leaves an irregular edge. */
const CEILING_N = 9;
const CEILING_STEP = 1400 / CEILING_N;

/* The bellies run one past the wrap so the strip's last one is the first one
   again — that is what makes the drift loop without a seam. Every wobble has a
   period of CEILING_N steps for the same reason; anything else and the two ends
   of the strip stop lining up. The in-between puffs are small enough never to
   touch either edge, so they need no such twin.

   Every value goes through q(): these are Math.sin results rendered straight
   into SVG attributes, and sin's precision is implementation-defined, so the
   server and the browser can disagree in the last bit and hydration fails on
   the difference. See quantise.ts. */
function ceilingPuffs(y: number, r: number, spread: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i <= CEILING_N; i++) {
    const t = (i * 2 * Math.PI) / CEILING_N;
    out.push([
      q(i * CEILING_STEP),
      q(y + 14 * Math.sin(t + 0.6)),
      q(r + spread * Math.sin(2 * t) + spread * 0.45 * Math.sin(3 * t + 1)),
    ]);
    if (i < CEILING_N) {
      out.push([
        q((i + 0.5) * CEILING_STEP),
        q(y - 18 + 13 * Math.sin(t + 2.1)),
        q(r * 0.62 + spread * 0.7 * Math.sin(3 * t + 0.4)),
      ]);
    }
  }
  return out;
}

const CEILING = ceilingPuffs(150, 92, 22);
/* hangs a little lower and drifts slower, so a second edge shows through */
const CEILING_BACK = ceilingPuffs(124, 72, 16);

function CeilingStrip({ puffs, gradient, deck }: { puffs: [number, number, number][]; gradient: string; deck?: boolean }) {
  return (
    <svg viewBox="0 0 1400 220" style={{ transform: "scaleY(-1)" }} aria-hidden focusable="false">
      <g fill={`url(#${gradient})`} filter="url(#rm-cloudy)">
        {deck && <rect x={-60} y={165} width={1520} height={260} />}
        {puffs.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}

function CardInner({ phase }: { phase: Phase }) {
  const current = !phase.locked;
  return (
    <>
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
                  <span className="rm-coming-sub">Above the clouds</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rm-divider" />

      <div className="rm-foot">
        <AnimatedLogo
          className="h-8 w-8 shrink-0"
          style={{ filter: "drop-shadow(0 2px 5px rgba(20,8,50,0.35))" }}
        />

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
    <div ref={rowRef} className={`rm-row rm-${side} ${open ? "is-open" : ""}`}>
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
    /* Coalesced into one frame.

       This measures the track and then writes a height — a layout read
       immediately followed by a layout invalidation. Lenis dispatches scroll
       every frame, so doing it in the handler means a forced synchronous
       relayout per event. That is affordable while the page is static, and it
       is not while a card is opening: the accordion animates
       grid-template-rows, so layout is already dirty every frame, and each
       read flushes a full relayout of a section thousands of pixels tall.
       That is the "scrolling goes slow, but only while the cards open" case.

       Deferring to rAF collapses any number of events into a single read and
       write, at the point in the frame where the browser is laying out
       anyway. */
    let frame = 0;

    const measure = () => {
      frame = 0;
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!track || !fill) return;
      const r = track.getBoundingClientRect();
      const centerY = window.innerHeight * 0.5;
      const h = Math.max(0, Math.min(r.height, centerY - r.top));
      fill.style.height = `${h}px`;
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section
      id="roadmap"
      className="relative isolate overflow-hidden"
      style={{
        // Under the weather. The band immediately below the ceiling is the
        // lightest part of the sky — the cloud bellies need *something* to
        // stand against — and everything below sinks steadily until it arrives
        // at roughly the bellies' own tone at the footer, which is what makes
        // the clouds read as part of this sky rather than laid on top of it.
        // Keep it all light and the ceiling reads as a dark stripe; take it
        // all the way down to the bellies and the whole page bottom goes flat.
        background: `linear-gradient(180deg, ${CHAINS_SEAM} 0%, #8A6BD4 14%, #7B58C8 36%, #6342A4 68%, ${ROADMAP_SEAM} 100%)`,
      }}
    >
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          {/* a touch more blur than the other banks use: these puffs are much
              larger, and 10 leaves the joins between them visibly pointed */}
          <filter id="rm-cloudy" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feGaussianBlur in="goo" stdDeviation="1.6" />
          </filter>
          {/* Read bottom-up: the strip is flipped, so the last stop lands on
              the section's top edge — which is why it has to be CHAINS_SEAM —
              and the first stop on the undersides hanging into the sky.

              The ramp is short on purpose. Run it across the whole cloud and
              every part of the silhouette is a different tone, so the bank
              reads as a soft shadow rather than as a mass; confined to the
              deck at the top, the hanging part is one flat colour and the
              handover to the section above still happens in the 50px nobody
              reads as cloud.

              The range is deliberately narrow — a handful of steps off the sky
              it hangs in, no more. Anything darker stops being weather and
              becomes a band ruled across the page, which is the failure mode
              this section keeps falling into. The silhouette only has to be
              *perceptible*; the rain emerging from under it does the rest. Lit along
              the top where it meets Multichain, heavy and dark underneath:
              that is a raincloud, and it is what the rain below falls out of.

              It ends at y=168 — where the deck starts — so the deck is flat
              CHAINS_SEAM the whole way across. Running the ramp on to 220 puts
              a fast colour change in the deck and a slow one in Multichain
              above it, and the eye reads that change in *rate* as an edge. */}
          <linearGradient id="rm-cloud-near" gradientUnits="userSpaceOnUse" x1="0" y1="106" x2="0" y2="168">
            <stop offset="0" stopColor="#7654C0" />
            <stop offset="0.45" stopColor="#7D5CC7" />
            <stop offset="1" stopColor={CHAINS_SEAM} />
          </linearGradient>
          <linearGradient id="rm-cloud-back" gradientUnits="userSpaceOnUse" x1="0" y1="96" x2="0" y2="168">
            <stop offset="0" stopColor="#6E50BC" stopOpacity="0.6" />
            <stop offset="1" stopColor={CHAINS_SEAM} stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>

      <div className="menoid-grid pointer-events-none absolute inset-0 z-0 opacity-40" />

      {/* the ceiling the rain comes out of */}
      <div className="cloud-band cloud-drift-slow left-0 top-0 z-[1]">
        <CeilingStrip puffs={CEILING_BACK} gradient="rm-cloud-back" />
        <CeilingStrip puffs={CEILING_BACK} gradient="rm-cloud-back" />
      </div>
      <div className="cloud-band cloud-drift left-0 top-0 z-[2]">
        <CeilingStrip puffs={CEILING} gradient="rm-cloud-near" deck />
        <CeilingStrip puffs={CEILING} gradient="rm-cloud-near" deck />
      </div>

      <RainFar />

      {/* The top padding clears the ceiling — white copy on a white cloud is
          unreadable. The strip is as wide as the section and keeps its 1400:220
          aspect, so it is 15.7vw tall (31.4vw below 768px, where .cloud-band
          doubles its width); the puffs hang through roughly 90% of that. The
          rest is breathing room. */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-[calc(28vw+72px)] sm:px-6 md:pt-[calc(14vw+104px)]">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.34em] text-white/70">
            ✦ The Voyage Ahead ✦
          </p>
          <h2
            className="font-round font-semibold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(32px, 4.8vw, 58px)", textShadow: "0 14px 34px rgba(38,18,80,0.4)" }}
          >
            Roadmap
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
            Three chapters chart the journey.{" "}
            <span className="font-semibold text-white">Stay tuned</span> for the V1 private beta —
            the rest stay sealed above the clouds.
          </p>
        </Reveal>

        {/* timeline */}
        <div ref={trackRef} className="rm-tl">
          <div className="rm-line" aria-hidden />
          <div ref={fillRef} className="rm-fill" aria-hidden>
            <span className="rm-drop">
              <Droplet size={20} />
            </span>
          </div>
          {PHASES.map((phase, i) => (
            <TimelineRow key={phase.version} phase={phase} index={i} />
          ))}
        </div>
      </div>

      {/* the waitlist closes the section — same sky, same rain */}
      <WaitlistCTA />

      <RainNear />
      <RainStyles />

      <style>{`
        .rm-tl { position: relative; padding-top: 18vh; }

        /* the thread down the middle, and the light that runs down it as you scroll */
        .rm-line {
          position: absolute; top: 0; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 0; border-left: 1px dashed rgba(255,255,255,0.28);
        }
        .rm-fill {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 2px; height: 0; border-radius: 2px;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(226,206,255,0.5));
          box-shadow: 0 0 16px rgba(232,216,255,0.75);
        }
        .rm-drop {
          position: absolute; left: 50%; bottom: -16px; transform: translateX(-50%);
          color: #fff; z-index: 5; pointer-events: none; line-height: 0;
          filter: drop-shadow(0 0 9px rgba(233,219,255,0.85));
          animation: rmDropShine 2.6s ease-in-out infinite;
        }
        @keyframes rmDropShine {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(233,219,255,0.5)); }
          50%      { filter: drop-shadow(0 0 16px rgba(255,255,255,1)); }
        }

        .rm-row { position: relative; display: flex; padding: 26px 0; }
        .rm-right { justify-content: flex-end; }
        .rm-left { justify-content: flex-start; }

        /* node on the thread + its connector */
        .rm-node {
          position: absolute; top: 30px; left: 50%; transform: translate(-50%, -50%);
          width: 13px; height: 13px; border-radius: 50%; z-index: 3;
          background: rgba(78,47,142,0.75); border: 1px solid rgba(255,255,255,0.5);
          transition: background .5s var(--ease-out-quart), border-color .5s, box-shadow .5s, transform .5s var(--ease-spring);
        }
        .rm-row.is-open .rm-node {
          background: #fff; border-color: #fff;
          box-shadow: 0 0 18px rgba(255,255,255,0.85); transform: translate(-50%, -50%) scale(1.15);
        }
        .rm-conn {
          position: absolute; top: 30px; height: 1px; width: 5%;
          border-top: 1px dashed rgba(255,255,255,0.35);
          opacity: 0; transition: opacity .6s ease .1s;
        }
        .rm-row.is-open .rm-conn { opacity: 1; }
        .rm-right .rm-conn { left: 50%; }
        .rm-left .rm-conn { right: 50%; }

        /* card — violet glass, so the rain shows through it */
        .rm-card {
          position: relative; width: 45%; border-radius: 22px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.2);
          background: linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 100%);
          /* 10px, not 16: the card is resizing while it opens and there are 150
             rain drops moving behind it, so the backdrop is re-sampled and
             re-blurred every frame. Cost scales with the radius and the
             difference at this opacity is not visible. */
          backdrop-filter: blur(10px) saturate(1.15); -webkit-backdrop-filter: blur(10px) saturate(1.15);
          box-shadow: 0 22px 50px rgba(35,16,74,0.34), 0 1px 0 rgba(255,255,255,0.28) inset;
          opacity: 0; transform: translateY(26px) scale(0.985);
          transition: opacity .7s var(--ease-out-quart), transform .8s var(--ease-out-quart),
                      border-color .7s, box-shadow .7s;
          will-change: transform, opacity;
        }
        .rm-row.is-open .rm-card {
          opacity: 1; transform: translateY(0) scale(1);
          border-color: rgba(255,255,255,0.38);
          box-shadow: 0 30px 70px rgba(35,16,74,0.42), 0 0 0 1px rgba(255,255,255,0.12),
                      0 0 46px rgba(196,166,255,0.22), 0 1px 0 rgba(255,255,255,0.34) inset;
        }

        /* light sweeping down the glass as it opens */
        .rm-card::after {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 4;
          background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
          transform: translateY(-110%); opacity: 0;
        }
        .rm-row.is-open .rm-card::after { animation: rmScan 1s var(--ease-out-quart) .15s 1; }
        @keyframes rmScan { 0% { transform: translateY(-110%); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(110%); opacity: 0; } }

        .rm-head { display: flex; align-items: center; gap: 12px; padding: 15px 18px; }
        .rm-num {
          font-family: var(--font-round), sans-serif; font-size: 14px; font-weight: 700;
          color: #fff; line-height: 1; padding: 5px 10px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.42); background: rgba(255,255,255,0.14);
        }
        .rm-htitle {
          font-family: var(--font-geist-mono), monospace; font-size: 11px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.62); white-space: nowrap;
        }
        .rm-corner { margin-left: auto; width: 7px; height: 7px; border-top: 1px solid rgba(255,255,255,0.45); border-right: 1px solid rgba(255,255,255,0.45); }

        .rm-divider { height: 1px; background: rgba(255,255,255,0.16); }

        .rm-bodywrap {
          display: grid; grid-template-rows: 0fr; opacity: 0;
          transition: grid-template-rows .72s var(--ease-out-quart), opacity .55s ease .1s;
        }
        .rm-row.is-open .rm-bodywrap { grid-template-rows: 1fr; opacity: 1; }
        /* contain: paint — the overflow is already clipped here, and saying so
           lets the browser skip painting the part of the body still hidden
           while the row animates open. */
        .rm-body { overflow: hidden; min-height: 0; contain: paint; }
        .rm-body-inner { padding: 16px 18px 18px; }

        .rm-bullets { display: flex; flex-direction: column; gap: 11px; }
        .rm-bullets li { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; line-height: 1.5; color: rgba(255,255,255,0.82); }
        .rm-emoji { flex-shrink: 0; font-size: 15px; line-height: 1.3; }

        .rm-cohorts { margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.18); }
        .rm-cohorts-label { font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 10px; }
        .rm-cohorts ul { display: flex; flex-direction: column; gap: 8px; }
        .rm-cohorts li { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #fff; font-weight: 500; }
        .rm-cohort-num { flex-shrink: 0; display: grid; place-items: center; width: 19px; height: 19px; border-radius: 50%; font-size: 10px; font-weight: 700; color: var(--violet-deep); background: #fff; }

        /* locked body */
        .rm-locked { position: relative; }
        .rm-blurred { filter: blur(6px); opacity: 0.5; user-select: none; pointer-events: none; }
        .rm-locked-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; text-align: center; }
        .rm-lock-badge { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; color: #fff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(3px); }
        .rm-coming { font-family: var(--font-round), sans-serif; font-size: 19px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
        .rm-coming-sub { font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.68); }

        .rm-foot { display: flex; align-items: center; gap: 10px; padding: 13px 18px; }
        .rm-foot-name { font-family: var(--font-geist-mono), monospace; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; color: rgba(255,255,255,0.7); }
        .rm-status { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; font-family: var(--font-geist-mono), monospace; font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; padding: 5px 10px; border-radius: 999px; }
        .rm-status-here { background: #fff; color: var(--violet-deep); }
        .rm-status-here .rm-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--violet-deep); }
        .rm-status-lock { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.75); }

        /* ---- mobile: thread on the left, all cards to the right ---- */
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
