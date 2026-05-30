"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TOTAL_MS = 5000;

/* ──────────────────────────────────────────────────────────
   Treasure-map inking loader.
   A quill drawing a winding route across a parchment chart.
   The dotted path inks itself; a small tag near the pen tip
   shows the percent; ✕ marks the spot reveals at 100%.
   ────────────────────────────────────────────────────────── */

// SVG path of the route through a 1600×900 viewBox. Bends through
// a few "islands" before reaching the X. Tuned to look hand-drawn.
const ROUTE_D =
  "M 110 540 " +
  "C 220 460, 320 380, 440 420 " +
  "S 620 560, 760 500 " +
  "S 940 320, 1080 380 " +
  "S 1280 520, 1400 460 " +
  "S 1520 360, 1500 320";

// Two small "islands" — landmarks the route passes near
const ISLANDS = [
  { x: 540, y: 510, r: 28 },
  { x: 1020, y: 340, r: 22 },
];

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"in" | "out" | "gone">("in");

  // Path measurements
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLen, setPathLen] = useState(0);
  const [pen, setPen] = useState({ x: 110, y: 540, angle: 0 });

  // Animation loop
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.style.overflow = "hidden";

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / TOTAL_MS) * 100);
      setProgress(pct);
      if (elapsed < TOTAL_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("out");
        window.setTimeout(() => {
          setPhase("gone");
          document.documentElement.style.overflow = "";
          document.body.dataset.loaded = "true";
        }, 800);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Measure the path once it mounts
  useLayoutEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
    }
  }, []);

  // Update pen tip position whenever progress changes
  useEffect(() => {
    if (!pathRef.current || !pathLen) return;
    const at = (progress / 100) * pathLen;
    const p = pathRef.current.getPointAtLength(at);
    // small lookahead for tangent direction
    const ahead = pathRef.current.getPointAtLength(
      Math.min(at + 0.5, pathLen),
    );
    const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
    setPen({ x: p.x, y: p.y, angle });
  }, [progress, pathLen]);

  if (phase === "gone") return null;

  const pct = Math.round(progress);
  const dashOffset = pathLen * (1 - progress / 100);

  return (
    <div
      aria-hidden={phase !== "in"}
      className={`fixed inset-0 z-[100] overflow-hidden transition-opacity duration-700 ${
        phase === "out" ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--bg)" }}
    >
      {/* Parchment wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(212,160,23,0.12) 0%, transparent 55%), radial-gradient(circle at 8% 10%, rgba(212,160,23,0.10), transparent 38%), radial-gradient(circle at 92% 90%, rgba(168,120,8,0.10), transparent 42%)",
        }}
      />
      <div className="grain absolute inset-0" />

      {/* Vignette so edges feel like an old chart */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(124,90,10,0.18) 100%)",
        }}
      />

      {/* The chart */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* Ink colour */}
          <linearGradient id="ink-route" x1="0" x2="1">
            <stop offset="0%"   stopColor="#3a2710" />
            <stop offset="60%"  stopColor="#1a1410" />
            <stop offset="100%" stopColor="#1a1410" />
          </linearGradient>
          {/* Gold accent */}
          <linearGradient id="gold-ink" x1="0" x2="1">
            <stop offset="0%"   stopColor="#a87808" />
            <stop offset="50%"  stopColor="#d4a017" />
            <stop offset="100%" stopColor="#f0d98b" />
          </linearGradient>
          <filter id="ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>

        {/* Top-right compass rose (tiny) */}
        <g transform="translate(1430,140)" opacity="0.75">
          <circle r="50" fill="none" stroke="rgba(26,20,16,0.30)" strokeWidth="0.8" />
          <circle r="38" fill="none" stroke="rgba(26,20,16,0.18)" strokeWidth="0.6" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = i % 4 === 0 ? 28 : 36;
            const r2 = 46;
            const x1 = Math.cos(a) * r1;
            const y1 = Math.sin(a) * r1;
            const x2 = Math.cos(a) * r2;
            const y2 = Math.sin(a) * r2;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(26,20,16,0.55)"
                strokeWidth={i % 4 === 0 ? 1.4 : 0.7}
                strokeLinecap="round"
              />
            );
          })}
          {/* 4-pt star */}
          <polygon
            points="0,-30 6,0 0,30 -6,0"
            fill="rgba(26,20,16,0.85)"
            opacity="0.9"
          />
          <polygon
            points="-30,0 0,-6 30,0 0,6"
            fill="rgba(168,120,8,0.85)"
            opacity="0.7"
          />
          <text
            y="-58"
            textAnchor="middle"
            fontFamily="var(--font-display), serif"
            fontWeight="700"
            fontSize="14"
            fill="rgba(26,20,16,0.7)"
          >
            N
          </text>
        </g>

        {/* Tiny decorative wave squiggles in the corners */}
        <g stroke="rgba(26,20,16,0.20)" strokeWidth="1" fill="none" strokeLinecap="round">
          <path d="M 140 200 C 160 190, 180 210, 200 200 S 240 190, 260 200" />
          <path d="M 140 230 C 160 220, 180 240, 200 230 S 240 220, 260 230" />
          <path d="M 240 760 C 260 750, 280 770, 300 760 S 340 750, 360 760" />
          <path d="M 240 790 C 260 780, 280 800, 300 790 S 340 780, 360 790" />
        </g>

        {/* "TERRA INCOGNITA" stamp */}
        <g transform="translate(1380,820) rotate(-6)" opacity="0.32">
          <rect
            x="-100"
            y="-16"
            width="200"
            height="32"
            fill="none"
            stroke="rgba(192,56,26,0.85)"
            strokeWidth="1.5"
            rx="3"
          />
          <text
            textAnchor="middle"
            y="6"
            fontFamily="var(--font-geist-mono), monospace"
            fontSize="14"
            letterSpacing="3"
            fill="rgba(122,28,8,0.85)"
            style={{ textTransform: "uppercase" }}
          >
            Terra Incognita
          </text>
        </g>

        {/* Islands */}
        {ISLANDS.map((isl, i) => (
          <g key={i} opacity="0.55">
            <circle
              cx={isl.x}
              cy={isl.y}
              r={isl.r}
              fill="none"
              stroke="rgba(26,20,16,0.35)"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            <circle
              cx={isl.x}
              cy={isl.y}
              r={isl.r - 8}
              fill="rgba(212,160,23,0.10)"
              stroke="rgba(168,120,8,0.40)"
              strokeWidth="0.8"
            />
            {/* tiny palm/coastline tick */}
            <line
              x1={isl.x}
              y1={isl.y - 4}
              x2={isl.x}
              y2={isl.y - 16}
              stroke="rgba(26,20,16,0.65)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Port marker — start of route */}
        <g transform="translate(110,540)">
          <circle r="10" fill="rgba(212,160,23,0.95)" stroke="rgba(124,90,10,0.95)" strokeWidth="1.5" />
          <circle r="3" fill="rgba(26,20,16,0.85)" />
          <text
            x="0"
            y="36"
            textAnchor="middle"
            fontFamily="var(--font-geist-mono), monospace"
            fontSize="11"
            letterSpacing="2.4"
            fill="rgba(26,20,16,0.65)"
            style={{ textTransform: "uppercase" }}
          >
            Port
          </text>
        </g>

        {/* X marks the spot — end of route */}
        <g
          transform="translate(1500,320)"
          style={{
            opacity: Math.max(0, (progress - 80) / 20),
            transition: "opacity 400ms ease",
          }}
        >
          <line x1="-18" y1="-18" x2="18" y2="18" stroke="#c0381a" strokeWidth="5" strokeLinecap="round" />
          <line x1="18" y1="-18" x2="-18" y2="18" stroke="#c0381a" strokeWidth="5" strokeLinecap="round" />
          <circle r="32" fill="none" stroke="rgba(192,56,26,0.5)" strokeWidth="1.2" strokeDasharray="4 4" />
          <text
            x="0"
            y="58"
            textAnchor="middle"
            fontFamily="var(--font-geist-mono), monospace"
            fontSize="11"
            letterSpacing="2.6"
            fill="rgba(122,28,8,0.9)"
            style={{ textTransform: "uppercase" }}
          >
            Treasure
          </text>
        </g>

        {/* The faded full route — shown behind, as a guide */}
        <path
          d={ROUTE_D}
          stroke="rgba(26,20,16,0.12)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="3 9"
          fill="none"
        />

        {/* The inked route — being drawn */}
        <path
          ref={pathRef}
          d={ROUTE_D}
          stroke="url(#ink-route)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeDasharray="6 10"
          strokeDashoffset={dashOffset}
          fill="none"
          filter="url(#ink-bleed)"
          style={{
            strokeDasharray: `${pathLen}`,
            strokeDashoffset: dashOffset,
            transition: "stroke-dashoffset 80ms linear",
          }}
        />

        {/* Pen / quill — at the tip of the inked route */}
        <g
          transform={`translate(${pen.x},${pen.y}) rotate(${pen.angle - 45})`}
          style={{ transition: "transform 80ms linear" }}
        >
          {/* tiny ink blob trailing */}
          <circle cx="0" cy="0" r="3.2" fill="#1a1410" />
          {/* feather/quill nib */}
          <g transform="translate(-2,-2)">
            <path
              d="M 0 0 L -22 -22 L -16 -32 L -4 -28 L 4 -16 Z"
              fill="#1a1410"
              opacity="0.9"
            />
            <path
              d="M 0 0 L -22 -22"
              stroke="#d4a017"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* feather barbs */}
            {Array.from({ length: 7 }).map((_, i) => {
              const t = i / 7;
              const sx = -4 - t * 18;
              const sy = -4 - t * 18;
              return (
                <line
                  key={i}
                  x1={sx}
                  y1={sy}
                  x2={sx - 5}
                  y2={sy + 5}
                  stroke="#1a1410"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  opacity={0.55 + t * 0.4}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {/* Number tag — HTML overlay positioned next to the pen tip */}
      <PenTag pen={pen} pct={pct} />
    </div>
  );
}

/* ─────────── Floating percent tag near the pen tip ─────────── */
function PenTag({
  pen,
  pct,
}: {
  pen: { x: number; y: number; angle: number };
  pct: number;
}) {
  // Convert SVG viewBox coords (1600×900) to viewport coords.
  // Since the SVG uses preserveAspectRatio="xMidYMid slice", we mimic that.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tagPos, setTagPos] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.max(vw / 1600, vh / 900);
      const dx = (vw - 1600 * scale) / 2;
      const dy = (vh - 900 * scale) / 2;
      setTagPos({
        left: pen.x * scale + dx,
        top: pen.y * scale + dy,
      });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [pen]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute"
      style={{
        left: tagPos.left,
        top: tagPos.top,
        transform: "translate(28px, -88px)",
        transition: "left 80ms linear, top 80ms linear",
      }}
    >
      <div
        className="relative flex items-baseline gap-1"
        style={{
          opacity: 0,
          animation: "float-in 700ms var(--ease-out-quart) 300ms forwards",
        }}
      >
        {/* small ink dash from number toward pen */}
        <span
          aria-hidden
          className="absolute -left-5 top-1/2 h-px w-5"
          style={{ background: "rgba(26,20,16,0.45)" }}
        />
        <span
          className="font-display font-black tabular-nums text-[var(--ink)]"
          style={{
            fontSize: "clamp(48px, 6vw, 84px)",
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            fontFeatureSettings: '"tnum" 1, "lnum" 1, "ss01" 1',
            textShadow:
              "0 1px 0 rgba(212,160,23,0.18), 0 8px 18px rgba(168,120,8,0.18)",
          }}
        >
          {pct.toString().padStart(2, "0")}
        </span>
        <span
          className="font-display italic font-light text-[var(--gold-deep)]"
          style={{
            fontSize: "clamp(20px, 2.4vw, 32px)",
            lineHeight: 1,
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}
