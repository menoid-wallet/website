"use client";

import { useEffect, useState } from "react";
import ChainOrbit from "./ChainOrbit";

/* ────────────────────────────────────────────────────────────
   MENOID — hero.
   A purple sky: the copy on the left, the mark and its chains on
   the right, cloud banks drifting across the bottom, sparkles
   throughout. Everything is drawn (SVG + CSS), no artwork.
   Geometry is fixed rather than random so the server and the
   client render the same tree.
   ──────────────────────────────────────────────────────────── */

type Puff = { cx: number; cy: number; r: number };

/* Cloud silhouettes — overlapping puffs that the goo filter fuses
   into a single soft cumulus. Drawn on a 0..400 × 0..200 mound. */
const CLOUD_SHAPES: Puff[][] = [
  [
    { cx: 58, cy: 120, r: 52 }, { cx: 126, cy: 84, r: 70 }, { cx: 212, cy: 68, r: 86 },
    { cx: 298, cy: 94, r: 64 }, { cx: 360, cy: 126, r: 46 }, { cx: 110, cy: 152, r: 54 },
    { cx: 205, cy: 154, r: 62 }, { cx: 292, cy: 150, r: 50 },
  ],
  [
    { cx: 50, cy: 132, r: 44 }, { cx: 112, cy: 96, r: 62 }, { cx: 186, cy: 82, r: 74 },
    { cx: 258, cy: 108, r: 54 }, { cx: 312, cy: 136, r: 40 }, { cx: 150, cy: 156, r: 50 },
    { cx: 232, cy: 158, r: 46 },
  ],
  [
    { cx: 64, cy: 110, r: 58 }, { cx: 146, cy: 74, r: 78 }, { cx: 236, cy: 92, r: 66 },
    { cx: 316, cy: 118, r: 52 }, { cx: 380, cy: 140, r: 38 }, { cx: 130, cy: 150, r: 56 },
    { cx: 246, cy: 152, r: 54 },
  ],
];

type CloudProps = { shape: number; x: number; y: number; scale: number };

function Cloud({ shape, x, y, scale }: CloudProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {CLOUD_SHAPES[shape].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
      ))}
    </g>
  );
}

/* One tileable strip of clouds. Rendered twice inside a .cloud-band,
   which then slides exactly one strip width — so the drift loops forever.
   A cloud that runs off one edge is drawn again 1400 units away on the
   other edge, so the two cut halves meet across the seam and read as a
   single cloud. Anything else stays clear of the edges: the strip clips,
   and a clipped cloud shows a hard vertical cut.
   `floor` welds the puffs onto a solid deck that runs past the bottom of
   the viewBox — without it the bank is hollow underneath and the sky
   shows through below the clouds. */
function CloudStrip({ clouds, gradient, floor }: { clouds: CloudProps[]; gradient: string; floor?: boolean }) {
  return (
    <svg viewBox="0 0 1400 220" aria-hidden focusable="false">
      <g fill={`url(#${gradient})`} filter="url(#hero-cloudy)">
        {floor && <rect x={-60} y={165} width={1520} height={260} />}
        {clouds.map((c, i) => (
          <Cloud key={i} {...c} />
        ))}
      </g>
    </svg>
  );
}

/* Back layer — small, distant clouds high in the sky. They start clear of
   the left edge so the wordmark in the nav never sits on one. */
const FAR_CLOUDS: CloudProps[] = [
  { shape: 1, x: 380, y: 10, scale: 0.42 },
  { shape: 2, x: 700, y: -6, scale: 0.32 },
  { shape: 0, x: 1000, y: 16, scale: 0.38 },
];

/* Mid layer — smaller and higher, so it reads as further away. It carries no
   floor: everything below its puffs is hidden behind the near bank, and both
   bands sit on the bottom edge so the only difference you see is the drift. */
const MID_CLOUDS: CloudProps[] = [
  { shape: 2, x: -160, y: 22, scale: 0.55 }, // ┐ same cloud, split
  { shape: 2, x: 1240, y: 22, scale: 0.55 }, // ┘ across the seam
  { shape: 0, x: 180, y: 28, scale: 0.5 },
  { shape: 1, x: 480, y: 18, scale: 0.58 },
  { shape: 2, x: 760, y: 26, scale: 0.52 },
  { shape: 0, x: 1000, y: 20, scale: 0.54 },
];

/* Front layer — the big fluffy floor of the sky. These overlap along the whole
   strip so the deck's straight top edge never shows between two puffs. */
const NEAR_CLOUDS: CloudProps[] = [
  { shape: 0, x: -120, y: 68, scale: 0.75 }, // ┐ same cloud, split
  { shape: 0, x: 1280, y: 68, scale: 0.75 }, // ┘ across the seam
  { shape: 1, x: 130, y: 58, scale: 0.8 },
  { shape: 2, x: 350, y: 64, scale: 0.72 },
  { shape: 0, x: 600, y: 55, scale: 0.78 },
  { shape: 1, x: 850, y: 62, scale: 0.75 },
  { shape: 2, x: 1060, y: 58, scale: 0.7 },
];

/* Sparkles — [left%, top%, size px, delay s, opacity] */
const SPARKS: [number, number, number, number, number][] = [
  [12, 22, 14, 0, 0.9], [22, 58, 9, 1.4, 0.6], [34, 14, 11, 2.1, 0.75],
  [46, 40, 8, 0.7, 0.5], [58, 18, 13, 1.9, 0.85], [67, 62, 10, 0.3, 0.6],
  [78, 28, 16, 1.1, 0.95], [88, 52, 9, 2.4, 0.55], [92, 16, 12, 0.9, 0.7],
  [7, 44, 10, 2.7, 0.5], [52, 70, 11, 1.6, 0.45], [83, 74, 8, 0.4, 0.4],
];

export default function Hero() {
  // Hold the hero entrance until the loader has finished, then rise in.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined" && document.body.dataset.revealed === "true") {
      setRevealed(true);
      return;
    }
    const onReveal = () => setRevealed(true);
    window.addEventListener("menoid:revealed", onReveal);
    // Safety net in case the loader was skipped or removed.
    const fallback = window.setTimeout(() => setRevealed(true), 4600);
    return () => {
      window.removeEventListener("menoid:revealed", onReveal);
      window.clearTimeout(fallback);
    };
  }, []);

  // Clean "rise from the bottom" entrance, delayed until `revealed` flips true.
  const rise = (delay: number): React.CSSProperties => ({
    opacity: 0,
    animation: revealed ? `hero-rise 820ms var(--ease-out-quart) ${delay}ms forwards` : "none",
  });

  return (
    <section
      id="top"
      // the bottom padding is the cloud zone: the banks live there, so the copy
      // never lands on top of a cloud. It is tighter on a phone, where the
      // strip — and so the bank — is proportionally shorter.
      className="bg-menoid relative isolate flex min-h-dvh flex-col overflow-hidden pt-20 pb-[104px] sm:pt-24 sm:pb-[170px] lg:pb-[210px]"
    >
      {/* ── printed grid ── */}
      <div className="menoid-grid absolute inset-0 z-0" />

      {/* ── shared cloud paint + goo. ChainOrbit draws its cloud with these
             too, so they have to stay defined here, above it in the tree. ── */}
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          {/* fuses the puffs of a cloud into one silhouette, then softens the rim */}
          <filter id="hero-cloudy" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feGaussianBlur in="goo" stdDeviation="1.6" />
          </filter>
          <linearGradient id="cloud-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#F2E7FF" />
            <stop offset="1" stopColor="#C9ABF0" />
          </linearGradient>
          <linearGradient id="cloud-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#E7D8FB" stopOpacity="0.7" />
            <stop offset="1" stopColor="#B99BE6" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="cloud-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#D8C6F5" stopOpacity="0.28" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── distant clouds along the top ── */}
      <div className="cloud-band cloud-drift-rev left-0 top-0 z-[1]">
        <CloudStrip clouds={FAR_CLOUDS} gradient="cloud-far" />
        <CloudStrip clouds={FAR_CLOUDS} gradient="cloud-far" />
      </div>

      {/* ── sparkles ── */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {SPARKS.map(([l, t, s, d, o], i) => (
          <svg
            key={i}
            className="spark absolute"
            style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s`, opacity: o }}
            viewBox="0 0 24 24"
            fill="#fff"
            aria-hidden
            focusable="false"
          >
            <path d="M12 0c0 6.6 5.4 12 12 12-6.6 0-12 5.4-12 12 0-6.6-5.4-12-12-12 6.6 0 12-5.4 12-12z" />
          </svg>
        ))}
      </div>

      {/* ── content: copy beside the mark on a laptop, stacked on a phone
             (column-reverse so the mark rides on top and the h1 still comes
             first in the document) ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col-reverse items-center justify-center gap-6 px-4 sm:gap-8 sm:px-6 lg:flex-row lg:justify-between lg:gap-10">
        {/* copy */}
        <div className="flex w-full flex-col items-center text-center lg:w-[48%] lg:items-start lg:text-left">
          <h1
            className="font-round mb-4 font-semibold leading-[1.08] text-white"
            // the floor is what a phone gets: at 375px the vw term is tiny, so
            // without it the headline would sit at its minimum and read small
            style={{ fontSize: "clamp(40px, 4.6vw, 60px)", ...rise(180) }}
          >
            <span style={{ textShadow: "0 14px 30px rgba(64,36,122,0.38)" }}>Your Crypto.</span>
            <br />
            {/* Gradient fill, and no shadow of any kind on this line: a text-shadow
                shows straight through the transparent glyphs, and a filter anywhere
                up the tree drops the background-clip and floods the whole box.
                backgroundImage, not `background` — the shorthand resets the clip. */}
            <span
              style={{
                backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #FBF4FF 40%, #E3CEFF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Your Privacy.
            </span>
          </h1>

          <p className="mb-5 max-w-md text-[17px] leading-relaxed text-white/85" style={rise(280)}>
            A wallet that keeps your on-chain activity private.
          </p>

          {/* the multichain line */}
          <div className="mb-6 flex items-center gap-3 sm:mb-7" style={rise(360)}>
            <span className="h-px w-8 bg-white/30 sm:w-12 lg:hidden" />
            <svg className="h-2.5 w-2.5 shrink-0 fill-white/70" viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M12 0c0 6.6 5.4 12 12 12-6.6 0-12 5.4-12 12 0-6.6-5.4-12-12-12 6.6 0 12-5.4 12-12z" />
            </svg>
            <span className="font-round text-[14px] tracking-[0.02em] text-white/75 sm:text-[15px]">
              built for the multichain world
            </span>
            <svg className="h-2.5 w-2.5 shrink-0 fill-white/70" viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M12 0c0 6.6 5.4 12 12 12-6.6 0-12 5.4-12 12 0-6.6-5.4-12-12-12 6.6 0 12-5.4 12-12z" />
            </svg>
            <span className="h-px w-8 bg-white/30 sm:w-12" />
          </div>

          {/* coming soon — one line on a wide screen, two stacked on a narrow one */}
          <div
            className="inline-flex max-w-full flex-col items-center gap-1.5 rounded-2xl px-5 py-3 sm:flex-row sm:gap-2.5 sm:rounded-full sm:py-2.5"
            style={{
              ...rise(450),
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.26)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset, 0 14px 32px rgba(64,36,122,0.22)",
              backdropFilter: "blur(14px)",
            }}
          >
            <span className="flex items-center gap-2.5">
              <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/75">V1 Early Access</span>
            </span>
            <span className="hidden h-3 w-px bg-white/25 sm:block" />
            <span className="font-round text-[14px] font-medium text-white sm:text-[15px]">
              registration coming soon…
            </span>
          </div>
        </div>

        {/* the mark and its chains */}
        <div className="w-full lg:w-[48%]" style={rise(0)}>
          <ChainOrbit />
        </div>
      </div>

      {/* ── the cloud floor: two banks drifting at different speeds. The near
             one carries the deck, so the bank is solid to the bottom edge. ── */}
      <div className="cloud-band cloud-drift-slow bottom-0 left-0 z-[3]">
        <CloudStrip clouds={MID_CLOUDS} gradient="cloud-mid" />
        <CloudStrip clouds={MID_CLOUDS} gradient="cloud-mid" />
      </div>
      <div className="cloud-band cloud-drift bottom-0 left-0 z-[4]">
        <CloudStrip clouds={NEAR_CLOUDS} gradient="cloud-near" floor />
        <CloudStrip clouds={NEAR_CLOUDS} gradient="cloud-near" floor />
      </div>
    </section>
  );
}
