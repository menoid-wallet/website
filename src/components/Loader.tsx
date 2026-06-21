"use client";

import { useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   MENOID — responsive image loader.
   Three images anchored around screen-center. Vertical offsets
   are vw-based so spacing stays TIGHT on narrow mobile screens
   (vh made the gaps blow out on tall phones). Width-driven sizing
   keeps the artwork large; transparent PNG padding overlaps
   harmlessly between the anchored layers.
   ──────────────────────────────────────────────────────────── */

const DRAW_MS    = 1800;   // line draws across this span, from t=0
const TOTAL_MS   = 3000;
const FADE_MS    = 380;    // wttu fade-out duration
const SWAP_FRAC  = 1;   // show MENOID when the line reaches 40% of its path
const FADE_FRAC  = 0.30;   // begin fading wttu just before the swap

const LINE_PATH = "M 14 22 C 190 8, 430 8, 606 22";

type Phase = "in" | "out" | "gone";
type Title = "headline" | "fadeout" | "menoid";

export default function Loader() {
  const [phase, setPhase] = useState<Phase>("in");
  const [title, setTitle] = useState<Title>("headline");
  const [lineFrac, setLineFrac] = useState(0);
  const [point, setPoint] = useState({ x: 14, y: 22 });
  const rafRef = useRef<number>(0);
  const pathRef = useRef<SVGPathElement | null>(null);
  const pathLenRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;

      // Keep Lenis smooth scroll stopped during loader duration
      (globalThis as any).__menoidLenis?.stop();

      // line draws immediately, from t=0
      const f = Math.min(1, elapsed / DRAW_MS);
      setLineFrac(f);
      const path = pathRef.current;
      if (path) {
        if (!pathLenRef.current) pathLenRef.current = path.getTotalLength();
        const p = path.getPointAtLength(f * pathLenRef.current);
        setPoint({ x: p.x, y: p.y });
      }

      // swap wttu → MENOID when the line passes 40% of its path
      if (f >= SWAP_FRAC) setTitle("menoid");
      else if (f >= FADE_FRAC) setTitle("fadeout");

      if (elapsed < TOTAL_MS) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("out");
        // Tell the hero (and anything else) the loader is done so its
        // entrance animation can play as the loader fades away.
        document.body.dataset.revealed = "true";
        window.dispatchEvent(new Event("menoid:revealed"));
        setTimeout(() => {
          setPhase("gone");
          document.documentElement.style.overflow = "";
          document.body.dataset.loaded = "true";
          (globalThis as any).__menoidLenis?.start(); // Enable scroll
        }, 800);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.documentElement.style.overflow = "";
      (globalThis as any).__menoidLenis?.start(); // Fallback enable scroll
    };
  }, []);

  if (phase === "gone") return null;

  /* anchor an element's CENTER at screen-center + vertical offset */
  const anchor = (offset: string): React.CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: `calc(50% + ${offset})`,
    transform: "translate(-50%, -50%)",
  });

  return (
    <div
      aria-hidden={phase !== "in"}
      className={`fixed inset-0 z-[100] overflow-hidden loader-screen ${phase === "out" ? "opacity-0" : "opacity-100"}`}
      style={{
        transition: "opacity 700ms ease",
      }}
    >
      {/* ── Solid backdrop ── */}
      <div 
        className="absolute inset-0 z-0 bg-parchment" 
        style={{ background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)" }}
      />

      {/* ── lockscreen backdrop orbs ── */}
      <div className="pointer-events-none absolute z-0" style={{ top: "-14%", right: "-18%", width: "min(80vw,340px)", height: "min(80vw,340px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,174,58,0.55) 0%, transparent 65%)", filter: "blur(40px)", animation: "ld-orb1 11s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute z-0" style={{ bottom: "-18%", left: "-22%", width: "min(86vw,380px)", height: "min(86vw,380px)", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,210,122,0.55) 0%, transparent 65%)", filter: "blur(48px)", animation: "ld-orb2 13s ease-in-out infinite 2s" }} />
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.30) 50%, transparent 70%)", animation: "ld-sheen 8s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] z-0" style={{ backgroundImage: "linear-gradient(to right,#171311 1px,transparent 1px),linear-gradient(to bottom,#171311 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="grain pointer-events-none absolute inset-0 opacity-[0.45] z-0" />

      {/* ── Loader Text / SVG content (z-10 relative to loader stack) ── */}
      <div className="relative z-10 w-full h-full">
        {/* ── WHERE TREASURE TRAVELS UNSEEN ── */}
        {title !== "menoid" && (
          <div
            style={{
              ...anchor("calc(-1 * clamp(30px, 5.5vw, 70px))"),
              opacity: title === "fadeout" ? 0 : 1,
              filter: title === "fadeout" ? "blur(10px)" : "blur(0)",
              transition: `opacity ${FADE_MS}ms var(--ease-in-out), transform ${FADE_MS}ms var(--ease-in-out), filter ${FADE_MS}ms var(--ease-in-out)`,
              animation: "ld-in 800ms var(--ease-out-quart) both",
            }}
          >
            <div
              aria-label="Where Treasure Travels Unseen"
              style={{
                fontFamily: "var(--font-fraunces), Georgia, 'Times New Roman', serif",
                fontWeight: 800,
                fontOpticalSizing: "none",
                fontVariationSettings: '"opsz" 42, "wght" 800, "SOFT" 0, "WONK" 0',
                color: "#171311",
                textAlign: "center",
                textTransform: "uppercase",
                lineHeight: 0.94,
                fontSize: "clamp(30px, 6.2vw, 72px)",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ fontSize: "0.44em", letterSpacing: "0.04em" }}>Where</div>
              <div>Treasure</div>
              <div style={{ fontSize: "0.44em", letterSpacing: "0.04em" }}>Travels Unseen</div>
            </div>
          </div>
        )}

        {/* ── MENOID ── */}
        {title === "menoid" && (
          <div style={{ ...anchor("calc(-1 * clamp(30px, 4.5vw, 40px))"), animation: "menoid-in 900ms var(--ease-out-quart) both" }}>
            <div
              style={{
                fontFamily: "var(--font-fraunces), Georgia, 'Times New Roman', serif",
                fontWeight: 800,
                fontOpticalSizing: "none",
                fontVariationSettings: '"opsz" 42, "wght" 800, "SOFT" 0, "WONK" 0',
                color: "#171311",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                fontSize: "clamp(38px, 8.4vw, 104px)",
                whiteSpace: "nowrap",
              }}
            >
              Menoid
            </div>
          </div>
        )}

        {/* ── hand-drawn loading line + pen point ── */}
        <div style={{ ...anchor("clamp(22px, 3.5vw, 32px)"), width: "min(70vw, 600px)", height: "clamp(24px, 5vw, 40px)" }}>
          <svg viewBox="0 0 620 44" preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="ld-ul" x1="0" x2="1">
                <stop offset="0%" stopColor="#A36E14" stopOpacity="0" />
                <stop offset="20%" stopColor="#A36E14" />
                <stop offset="50%" stopColor="#E8AE3A" />
                <stop offset="80%" stopColor="#A36E14" />
                <stop offset="100%" stopColor="#A36E14" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={LINE_PATH} stroke="rgba(163,110,20,0.18)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path
              ref={pathRef}
              d={LINE_PATH}
              pathLength={100}
              stroke="url(#ld-ul)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - lineFrac) }}
            />
            {lineFrac > 0 && lineFrac < 1 && (
              <g transform={`translate(${point.x}, ${point.y})`}>
                <circle r="9" fill="rgba(232,174,58,0.25)" />
                <circle r="4" fill="#E8AE3A" stroke="#A36E14" strokeWidth="1" />
                <circle r="1.4" fill="#fffaf0" />
              </g>
            )}
            {lineFrac >= 1 && <circle cx={606} cy={22} r="4" fill="#A36E14" />}
          </svg>
        </div>


      </div>

      <style>{`
        @keyframes ld-in {
          0%   { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); filter: blur(6px); }
          100% { opacity: 1; transform: translate(-50%, -50%); filter: blur(0); }
        }
        @keyframes menoid-in {
          0%   { opacity: 0; transform: translate(-50%, calc(-50% + 24px)) scale(1.06); filter: blur(12px); }
          60%  { opacity: 1; transform: translate(-50%, -50%) scale(0.995); filter: blur(0); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        }
        @keyframes ld-orb1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-12px) scale(1.08); } }
        @keyframes ld-orb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-18px,14px) scale(1.05); } }
        @keyframes ld-sheen { 0%,100% { transform: translateX(-30%); opacity: 0; } 50% { transform: translateX(30%); opacity: 0.4; } }
      `}</style>
    </div>
  );
}