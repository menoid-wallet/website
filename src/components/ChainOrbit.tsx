"use client";

import AnimatedLogo from "./AnimatedLogo";
import { q } from "./quantise";

/* ────────────────────────────────────────────────────────────
   The mark, resting on a cloud, ringed by the chains it covers.
   Official chain glyphs in mono form (fill: currentColor) so they
   take the violet ink of the theme instead of their brand colours.
   The ring rotates slowly; each badge breathes on its own offset.
   ──────────────────────────────────────────────────────────── */

type Chain = { name: string; icon: React.ReactNode };

// Clockwise from the top — the arrangement of the brand artwork.
const CHAINS: Chain[] = [
  {
    name: "Ethereum",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M12 3v6.652l5.625 2.516zm0 0-5.625 9.166L12 9.652zm0 13.478V21l5.625-7.785zM12 21v-4.522l-5.625-3.263z" />
        <path d="m12 15.43 5.625-3.263L12 9.652zm-5.625-3.263L12 15.43V9.652z" />
        <path fillRule="evenodd" d="m12 15.43-5.625-3.262L12 3l5.625 9.166zm-5.25-3.528 5.162-8.41v6.115zm-.077.229 5.239-2.327v5.364zm5.418-2.327v5.364l5.233-3.037zm0-.197 5.162 2.295-5.162-8.41z" clipRule="evenodd" />
        <path fillRule="evenodd" d="m12 16.407-5.625-3.195L12 21l5.625-7.789zm-4.995-2.633 4.906 2.79v4.005zm5.085 2.79v4.005l4.904-6.795z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: "Base",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M3 4.706c0-.585 0-.877.11-1.101.106-.215.28-.39.496-.495C3.83 3 4.122 3 4.706 3h14.588c.585 0 .876 0 1.101.11.215.105.389.28.494.495.111.225.111.517.111 1.101v14.588c0 .585 0 .876-.11 1.101-.106.215-.28.389-.495.494-.225.111-.517.111-1.101.111H4.706c-.585 0-.876 0-1.101-.11a1.08 1.08 0 0 1-.494-.495C3 20.17 3 19.878 3 19.294z" />
      </svg>
    ),
  },
  {
    name: "Arbitrum",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="m13.353 13.368-.885 2.39a.3.3 0 0 0 0 .205l1.523 4.112 1.76-1.001-2.113-5.706a.152.152 0 0 0-.285 0m1.774-4.019a.152.152 0 0 0-.285 0l-.885 2.39a.3.3 0 0 0 0 .205l2.494 6.732 1.761-1.001z" />
        <path d="M11.998 4.115a.3.3 0 0 1 .126.033l6.715 3.818a.25.25 0 0 1 .126.214v7.635c0 .089-.048.17-.126.214l-6.715 3.819a.25.25 0 0 1-.126.032.3.3 0 0 1-.125-.032l-6.715-3.815a.25.25 0 0 1-.126-.215V8.182c0-.089.048-.17.126-.215l6.715-3.818a.26.26 0 0 1 .125-.034m0-1.115c-.238 0-.478.06-.692.183L4.593 7A1.36 1.36 0 0 0 3.9 8.182v7.635c0 .487.264.938.693 1.181l6.714 3.819a1.41 1.41 0 0 0 1.386 0l6.714-3.818a1.36 1.36 0 0 0 .693-1.182V8.182A1.36 1.36 0 0 0 19.407 7l-6.716-3.817A1.4 1.4 0 0 0 11.998 3" />
        <path d="m7.559 18.685.617-1.666 1.244 1.018-1.163 1.046zm3.874-11.05H9.731a.3.3 0 0 0-.285.197l-3.649 9.852 1.761 1.001 4.018-10.849a.15.15 0 0 0-.143-.2" />
        <path d="M14.412 7.635h-1.703a.3.3 0 0 0-.284.197l-4.167 11.25 1.761 1 4.535-12.246a.15.15 0 0 0-.142-.2" />
      </svg>
    ),
  },
  {
    name: "Sui",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M16.129 10.508a5.44 5.44 0 0 1 1.148 3.356 5.47 5.47 0 0 1-1.18 3.4l-.064.079-.016-.107a5 5 0 0 0-.053-.26c-.37-1.656-1.566-3.08-3.546-4.233-1.334-.774-2.102-1.705-2.304-2.765a4.1 4.1 0 0 1 .16-1.969c.15-.494.385-.961.693-1.376l.773-.963a.334.334 0 0 1 .519 0zm1.217-.964L12.19 3.092a.243.243 0 0 0-.38 0L6.653 9.549l-.016.016a7.1 7.1 0 0 0-1.52 4.405C5.118 17.85 8.199 21 12 21s6.883-3.15 6.883-7.03a7.1 7.1 0 0 0-1.52-4.405zm-9.46.943.46-.577.017.105.037.255c.301 1.604 1.366 2.938 3.15 3.97 1.551.905 2.45 1.943 2.71 3.081.1.443.128.898.079 1.35v.027l-.021.01a5.2 5.2 0 0 1-2.319.544c-2.911 0-5.278-2.412-5.278-5.388a5.44 5.44 0 0 1 1.165-3.377" />
      </svg>
    ),
  },
  {
    name: "Monad",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M12 3c-2.599 0-9 6.4-9 9s6.401 9 9 9 9-6.401 9-9-6.401-9-9-9m-1.402 14.146c-1.097-.298-4.043-5.453-3.744-6.549s5.453-4.042 6.549-3.743c1.095.298 4.042 5.453 3.743 6.549-.298 1.095-5.453 4.042-6.549 3.743" />
      </svg>
    ),
  },
  {
    name: "Polygon",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="m16.364 15.217 4.27-2.435a.73.73 0 0 0 .366-.627V7.284a.72.72 0 0 0-.366-.627l-4.27-2.435a.74.74 0 0 0-.732 0l-4.27 2.435a.72.72 0 0 0-.366.627v8.704l-2.994 1.707-2.994-1.707v-3.415l2.994-1.707 1.974 1.127V9.702l-1.608-.918a.75.75 0 0 0-.732 0l-4.27 2.435a.72.72 0 0 0-.366.627v4.87c0 .258.14.498.366.627l4.27 2.436a.75.75 0 0 0 .732 0l4.27-2.436a.72.72 0 0 0 .366-.626V8.012l.053-.03 2.94-1.677 2.994 1.707v3.415l-2.994 1.707-1.972-1.124v2.291l1.606.916a.75.75 0 0 0 .732 0z" />
      </svg>
    ),
  },
  {
    name: "Aptos",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M15.336 9.02a.65.65 0 0 1-.483-.217l-.643-.726a.507.507 0 0 0-.757 0l-.552.623a.95.95 0 0 1-.713.322h-8.68a9 9 0 0 0-.473 2.221h8.196a.53.53 0 0 0 .38-.163l.764-.796a.5.5 0 0 1 .365-.155h.031c.145 0 .283.061.379.17l.643.726a.65.65 0 0 0 .483.218h6.69a9 9 0 0 0-.473-2.221zm-7.341 6.894a.53.53 0 0 0 .38-.163l.764-.796a.5.5 0 0 1 .365-.156h.031c.145 0 .283.062.379.17l.643.727a.65.65 0 0 0 .483.218h9.066c.34-.702.588-1.456.736-2.244h-8.701a.65.65 0 0 1-.483-.217l-.643-.727a.507.507 0 0 0-.757 0l-.552.624a.95.95 0 0 1-.713.321H3.158c.148.789.397 1.542.737 2.243zm6.431-9.32a.53.53 0 0 0 .382-.163l.763-.796a.5.5 0 0 1 .364-.155h.032c.144 0 .283.061.378.17l.643.727a.65.65 0 0 0 .484.217h1.723A8.99 8.99 0 0 0 12.001 3a8.99 8.99 0 0 0-7.195 3.594zm-5.82 11.544a.65.65 0 0 1-.484-.218l-.643-.726a.507.507 0 0 0-.756 0l-.552.623a.95.95 0 0 1-.713.321h-.037A8.97 8.97 0 0 0 12.001 21a8.97 8.97 0 0 0 6.578-2.862z" />
      </svg>
    ),
  },
  {
    name: "Solana",
    icon: (
      <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
        <path d="M18.413 7.903a.62.62 0 0 1-.411.162H3.58c-.512 0-.77-.585-.416-.928l2.369-2.283a.6.6 0 0 1 .41-.17H20.42c.517 0 .77.591.41.935zm0 11.255a.62.62 0 0 1-.411.157H3.58c-.512 0-.77-.58-.416-.922l2.369-2.29a.6.6 0 0 1 .41-.163H20.42c.517 0 .77.585.41.928zm0-8.686a.62.62 0 0 0-.411-.157H3.58c-.512 0-.77.58-.416.922l2.369 2.29a.6.6 0 0 0 .41.163H20.42c.517 0 .77-.585.41-.928z" />
      </svg>
    ),
  },
];

const RADIUS = 41; // % of the box, centre to badge

const BADGE_CLOUD = "#F8F3FF";

/* The three chains along the bottom stand on the bank, so their labels land on
   white and have to be inked in violet — the white-on-purple treatment the
   others use disappears there. Indices into CHAINS: Sui, Monad, Polygon. */
const LABEL_ON_CLOUD = new Set([3, 4, 5]);

/* Twinkles scattered through the ring — [x%, y%, size px, delay s] */
const TWINKLES: [number, number, number, number][] = [
  [16, 24, 9, 0], [82, 20, 11, 1.3], [50, 8, 7, 2.2], [90, 62, 8, 0.6],
  [10, 66, 10, 1.8], [30, 88, 7, 2.6], [70, 92, 9, 0.9], [4, 44, 7, 1.5],
  [62, 34, 6, 2.9], [38, 58, 6, 0.4],
];

export default function ChainOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[304px] sm:max-w-[400px] lg:max-w-[500px]">
      {/* the bloom the mark sits in */}
      <div
        className="halo-pulse pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "118%",
          height: "118%",
          background:
            "radial-gradient(circle, rgba(255,247,255,0.62) 0%, rgba(236,212,255,0.34) 32%, rgba(236,212,255,0) 64%)",
        }}
      />

      {/* the ring the chains ride on: a lit line threading every badge, with
          a handful of sparks travelling slowly around it */}
      <svg viewBox="0 0 200 200" className="pointer-events-none z-0 absolute inset-0 h-full w-full" aria-hidden focusable="false">
        <defs>
          <filter id="orbit-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        {/* the glow under the line */}
        <circle
          cx="100" cy="100" r={RADIUS * 2}
          fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4"
          filter="url(#orbit-glow)"
        />
        {/* the line itself */}
        <circle cx="100" cy="100" r={RADIUS * 2} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.4" />
        {/* sparks riding the wire, offset to sit between the badges */}
        <g className="orbit-spin" style={{ transformBox: "view-box", transformOrigin: "100px 100px" }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (-90 + 11.25 + i * 22.5) * (Math.PI / 180);
            // q(): trig straight into an SSR-ed attribute — see quantise.ts
            const cx = q(100 + RADIUS * 2 * Math.cos(a));
            const cy = q(100 + RADIUS * 2 * Math.sin(a));
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r="1.4" fill="rgba(255,255,255,0.65)" filter="url(#orbit-glow)" />
                <circle cx={cx} cy={cy} r="0.7" fill="#fff" />
              </g>
            );
          })}
        </g>
      </svg>

      {/* twinkles over the whole orbit */}
      {TWINKLES.map(([x, y, s, d], i) => (
        <svg
          key={i}
          className="spark pointer-events-none absolute"
          style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }}
          viewBox="0 0 24 24"
          fill="#fff"
          aria-hidden
          focusable="false"
        >
          <path d="M12 0c0 6.6 5.4 12 12 12-6.6 0-12 5.4-12 12 0-6.6-5.4-12-12-12 6.6 0 12-5.4 12-12z" />
        </svg>
      ))}

      {/* The bank the whole thing rests on. It sits here — behind the badges and
          behind the mark — so it never covers them; only its top shows, and the
          mark and the bottom three chains stand in front of it. */}
      <svg
        viewBox="0 0 600 200"
        // wide enough to run under the bottom three chains and deep enough that
        // their labels sit on it rather than straddling its edge
        className="pointer-events-none absolute bottom-[-2%] left-1/2 w-[126%] -translate-x-1/2"
        aria-hidden
        focusable="false"
      >
        <g fill="url(#cloud-near)" filter="url(#hero-cloudy)">
          <circle cx="300" cy="96" r="66" />
          <circle cx="212" cy="112" r="56" />
          <circle cx="388" cy="112" r="54" />
          <circle cx="140" cy="130" r="46" />
          <circle cx="460" cy="130" r="44" />
          <circle cx="82" cy="148" r="38" />
          <circle cx="518" cy="148" r="36" />
          <circle cx="44" cy="160" r="28" />
          <circle cx="556" cy="160" r="26" />
          <circle cx="300" cy="148" r="44" />
          <circle cx="200" cy="152" r="38" />
          <circle cx="400" cy="152" r="38" />
        </g>
      </svg>

      {/* the chains */}
      {CHAINS.map((chain, i) => {
        const angle = (-90 + i * (360 / CHAINS.length)) * (Math.PI / 180);
        return (
          <div
            key={chain.name}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{
              // q(): trig straight into an SSR-ed inline style — see quantise.ts
              left: `${q(50 + RADIUS * Math.cos(angle))}%`,
              top: `${q(50 + RADIUS * Math.sin(angle))}%`,
            }}
          >
            <div
              className="chain-bob relative"
              style={{
                width: "clamp(36px, 9vw, 54px)",
                height: "clamp(36px, 9vw, 54px)",
                animationDelay: `${i * 0.45}s`,
              }}
              title={chain.name}
            >
              {/* a beautiful small fluffy cloud background */}
              <svg
                viewBox="0 0 24 24"
                className="absolute left-1/2 top-1/2 h-[125%] w-[125%] -translate-x-1/2 -translate-y-1/2"
                aria-hidden
                style={{
                  filter: "drop-shadow(0 6px 14px rgba(64,36,122,0.34))",
                }}
              >
                <path
                  d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z"
                  fill={BADGE_CLOUD}
                />
              </svg>
              <span className="relative grid h-full w-full place-items-center" style={{ color: "var(--logo-ink)" }}>
                <span className="block h-[52%] w-[52%]">{chain.icon}</span>
              </span>
            </div>
            <span
              className="font-round mt-1.5 hidden text-[11px] font-medium tracking-wide sm:block"
              style={
                LABEL_ON_CLOUD.has(i)
                  ? { color: "var(--violet-deep)", textShadow: "0 1px 6px rgba(255,255,255,0.8)" }
                  : { color: "rgba(255,255,255,0.9)", textShadow: "0 2px 8px rgba(64,36,122,0.5)" }
              }
            >
              {chain.name}
            </span>
          </div>
        );
      })}

      {/* The mark. This box is exactly the mark's box, so centring it centres the
          *mark* in the ring — centring the mark and its cloud together instead
          pushes the mark above the middle and reads as hung too high. The cloud
          it stands on is drawn earlier, behind everything. */}
      <div className="absolute left-1/2 top-1/2 w-[75%] -translate-x-1/2 -translate-y-1/2 lg:w-[75%]">
        {/* the shine it gives off */}
        <div
          className="halo-pulse pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "190%",
            height: "190%",
            background: "radial-gradient(circle, rgba(255,252,255,0.5) 0%, rgba(240,222,255,0.22) 40%, rgba(240,222,255,0) 70%)",
          }}
        />
        {/* the shadow sits on the floating element, not on the image inside it:
            a filter under an animating transform has to be re-rastered every
            frame, and the layer can end up not painting at all */}
        <div className="logo-float relative" style={{ filter: "drop-shadow(0 22px 30px rgba(72,42,132,0.45))" }}>
          <AnimatedLogo priority className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}
