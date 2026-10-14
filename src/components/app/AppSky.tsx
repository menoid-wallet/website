/* ────────────────────────────────────────────────────────────
   The app's sky — the website hero's lilac sky, softer: a pink
   bloom up top, the printed grid, sparkles, and two cloud banks
   drifting along the bottom at different speeds. Drawn, not
   painted; fixed geometry so server and client agree.
   ──────────────────────────────────────────────────────────── */

type Puff = { cx: number; cy: number; r: number };
type CloudProps = { shape: number; x: number; y: number; scale: number };

const SHAPES: Puff[][] = [
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

const NEAR: CloudProps[] = [
  { shape: 0, x: -120, y: 78, scale: 0.75 }, { shape: 0, x: 1280, y: 78, scale: 0.75 },
  { shape: 1, x: 130, y: 70, scale: 0.8 }, { shape: 2, x: 350, y: 76, scale: 0.72 },
  { shape: 0, x: 600, y: 66, scale: 0.78 }, { shape: 1, x: 850, y: 72, scale: 0.75 },
  { shape: 2, x: 1060, y: 68, scale: 0.7 },
];
const MID: CloudProps[] = [
  { shape: 2, x: -160, y: 30, scale: 0.55 }, { shape: 2, x: 1240, y: 30, scale: 0.55 },
  { shape: 0, x: 180, y: 36, scale: 0.5 }, { shape: 1, x: 480, y: 26, scale: 0.58 },
  { shape: 2, x: 760, y: 34, scale: 0.52 }, { shape: 0, x: 1000, y: 28, scale: 0.54 },
];
const FAR: CloudProps[] = [
  { shape: 1, x: 380, y: 10, scale: 0.42 }, { shape: 2, x: 700, y: -6, scale: 0.32 }, { shape: 0, x: 1000, y: 16, scale: 0.38 },
];

const SPARKS: [number, number, number, number, number][] = [
  [8, 18, 12, 0, 0.85], [19, 52, 8, 1.4, 0.55], [31, 12, 10, 2.1, 0.7], [44, 34, 7, 0.7, 0.45],
  [62, 16, 12, 1.9, 0.8], [71, 48, 9, 0.3, 0.55], [83, 24, 14, 1.1, 0.9], [92, 44, 8, 2.4, 0.5],
  [5, 40, 9, 2.7, 0.45], [55, 60, 10, 1.6, 0.4],
];

function Strip({ clouds, fill, floor }: { clouds: CloudProps[]; fill: string; floor?: boolean }) {
  return (
    <svg viewBox="0 0 1400 220" aria-hidden focusable="false">
      <g fill={`url(#${fill})`} filter="url(#app-cloudy)">
        {floor && <rect x={-60} y={175} width={1520} height={260} />}
        {clouds.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.scale})`}>
            {SHAPES[c.shape].map((p, j) => (
              <circle key={j} cx={p.cx} cy={p.cy} r={p.r} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function AppSky() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="bg-menoid absolute inset-0" />
      {/* a pink bloom, so the app reads lighter and warmer than the hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 85% 0%, rgba(255,226,246,0.75) 0%, rgba(255,226,246,0) 60%), radial-gradient(60% 45% at 10% 20%, rgba(255,240,252,0.35) 0%, rgba(255,240,252,0) 70%)",
        }}
      />
      <div className="menoid-grid absolute inset-0 opacity-70" />

      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id="app-cloudy" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feGaussianBlur in="goo" stdDeviation="1.6" />
          </filter>
          <linearGradient id="app-cloud-near" gradientUnits="userSpaceOnUse" x1="0" y1="40" x2="0" y2="220">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#FBF2FF" />
            <stop offset="1" stopColor="#EFDDFD" />
          </linearGradient>
          <linearGradient id="app-cloud-mid" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="220">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#F1E2FD" stopOpacity="0.7" />
            <stop offset="1" stopColor="#D9C2F6" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="app-cloud-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#E3D2F8" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      <div className="cloud-band cloud-drift-rev left-0 top-16 opacity-80">
        <Strip clouds={FAR} fill="app-cloud-far" />
        <Strip clouds={FAR} fill="app-cloud-far" />
      </div>

      {SPARKS.map(([l, t, s, d, o], i) => (
        <svg key={i} className="spark absolute" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s`, opacity: o }} viewBox="0 0 24 24" fill="#fff">
          <path d="M12 0c0 6.6 5.4 12 12 12-6.6 0-12 5.4-12 12 0-6.6-5.4-12-12-12 6.6 0 12-5.4 12-12z" />
        </svg>
      ))}

      <div className="cloud-band cloud-drift-slow bottom-0 left-0 opacity-90">
        <Strip clouds={MID} fill="app-cloud-mid" />
        <Strip clouds={MID} fill="app-cloud-mid" />
      </div>
      <div className="cloud-band cloud-drift bottom-0 left-0">
        <Strip clouds={NEAR} fill="app-cloud-near" floor />
        <Strip clouds={NEAR} fill="app-cloud-near" floor />
      </div>
    </div>
  );
}
