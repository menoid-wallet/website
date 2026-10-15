"use client";

import Reveal from "./Reveal";
import { HERO_SEAM, MIST_SEAM, MODES_SEAM } from "./seams";
import { AccountMock, MaskMock, RegisterMock, SendMock, SwapMock, UnmaskMock, ViewingKeyMock } from "./showcase/AppMocks";

/* ────────────────────────────────────────────────────────────
   V1 MAINNET — the private app, step by step, right under the
   hero. Each step is the app's own box (drawn, not a screenshot:
   see showcase/AppMocks) beside a line of copy, alternating sides.
   (V0.5, the older wallet, lives in the roadmap.)

   The sky is the one the old Wallet Modes section carried: it opens
   on the hero's deck colour (HERO_SEAM), the mist bank bottoms out on
   MIST_SEAM, and a short band below it ends on MODES_SEAM, where
   Multichain begins. See seams.ts.
   ──────────────────────────────────────────────────────────── */

type Step = { id: string; title: string; text: string; mock: React.ReactNode };

const STEPS: Step[] = [
  {
    id: "connect",
    title: "Connect & register",
    text: "Connect your wallet and sign once: your private keys are made in your browser, and one transaction opens your private account.",
    mock: <RegisterMock />,
  },
  {
    id: "mask",
    title: "Mask your funds",
    text: "Move tokens from your public wallet into a private balance only you can see.",
    mock: <MaskMock />,
  },
  {
    id: "send",
    title: "Send privately",
    text: "Pay any registered address — a relayer submits it, so your address never appears on-chain.",
    mock: <SendMock />,
  },
  {
    id: "swap",
    title: "Swap privately",
    text: "Trade inside the pool on Uniswap V3 or Capricorn — what you buy lands as a new private note.",
    mock: <SwapMock />,
  },
  {
    id: "unmask",
    title: "Unmask anytime",
    text: "Withdraw to your own wallet or any other address, whenever you choose.",
    mock: <UnmaskMock />,
  },
  {
    id: "account",
    title: "Your private account",
    text: "Balances, your viewing key and your full history — decrypted only in your browser.",
    mock: <AccountMock />,
  },
  {
    id: "compliance",
    title: "Compliance-friendly by design",
    text: "Share a viewing key and whoever you choose can read your activity — an auditor, an exchange — but never spend a thing.",
    mock: <ViewingKeyMock />,
  },
];

/* ── Clouds ── (the same puffs and goo as the hero's; own id prefix) */
type Puff = { cx: number; cy: number; r: number };
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

function CloudStrip({ clouds, gradient, floor }: { clouds: CloudProps[]; gradient: string; floor?: boolean }) {
  return (
    <svg viewBox="0 0 1400 220" aria-hidden focusable="false">
      <g fill={`url(#${gradient})`} filter="url(#mt-cloudy)">
        {floor && <rect x={-60} y={165} width={1520} height={260} />}
        {clouds.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.scale})`}>
            {CLOUD_SHAPES[c.shape].map((p, j) => (
              <circle key={j} cx={p.cx} cy={p.cy} r={p.r} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

/* A cloud that runs off one edge is drawn again 1400 units away on the other,
   so the two cut halves meet across the seam and the drift loops seamlessly. */
const WISPS: CloudProps[] = [
  { shape: 1, x: 120, y: 30, scale: 0.4 },
  { shape: 2, x: 620, y: 8, scale: 0.32 },
  { shape: 0, x: 1010, y: 40, scale: 0.36 },
];
const MIST_BACK: CloudProps[] = [
  { shape: 2, x: -160, y: 34, scale: 0.62 },
  { shape: 2, x: 1240, y: 34, scale: 0.62 },
  { shape: 0, x: 200, y: 40, scale: 0.55 },
  { shape: 1, x: 560, y: 28, scale: 0.66 },
  { shape: 2, x: 900, y: 38, scale: 0.58 },
];
const MIST_FRONT: CloudProps[] = [
  { shape: 0, x: -120, y: 62, scale: 0.8 },
  { shape: 0, x: 1280, y: 62, scale: 0.8 },
  { shape: 1, x: 160, y: 52, scale: 0.85 },
  { shape: 2, x: 380, y: 58, scale: 0.76 },
  { shape: 0, x: 620, y: 50, scale: 0.82 },
  { shape: 1, x: 880, y: 56, scale: 0.8 },
  { shape: 2, x: 1080, y: 52, scale: 0.74 },
];

/* ── one step: the copy and the box, the box alternating sides ──
   The copy comes first in the document, so on a phone the heading
   leads and the box follows. */
function StepRow({ step, index }: { step: Step; index: number }) {
  const boxRight = index % 2 === 1;
  return (
    <div id={`step-${step.id}`} className="grid scroll-mt-24 items-center gap-8 md:grid-cols-2 md:gap-14">
      <Reveal className={boxRight ? "md:order-1" : "md:order-2"} delay={120}>
        <div className={`max-w-lg ${boxRight ? "md:ml-auto" : ""}`}>
          <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[var(--violet)]">Step {String(index + 1).padStart(2, "0")}</p>
          <h3 className="font-round mt-3 font-semibold tracking-[-0.02em] text-[var(--violet-deep)]" style={{ fontSize: "clamp(30px, 3.6vw, 44px)", lineHeight: 1.1 }}>
            {step.title}
          </h3>
          <p className="mt-4 text-[16.5px] leading-relaxed text-[var(--violet-deep)]/72 sm:text-[18px]">{step.text}</p>
        </div>
      </Reveal>
      <Reveal className={boxRight ? "md:order-2" : "md:order-1"}>
        <div className="relative">
          {/* a soft glow, so the glass box sits in the sky rather than on it */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0))", filter: "blur(18px)" }}
            aria-hidden
          />
          <div className="relative">{step.mock}</div>
        </div>
      </Reveal>
    </div>
  );
}

export default function MainnetTour() {
  return (
    <section
      id="v1-mainnet"
      // opens on the hero's deck colour — the clouds above simply keep going
      className="relative isolate overflow-hidden pt-24 sm:pt-28"
      style={{ background: `linear-gradient(180deg, ${HERO_SEAM} 0%, #EDE4FC 24%, #F3ECFE 62%, #E9DFFB 100%)` }}
    >
      {/* cloud paint + the goo that fuses the puffs */}
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id="mt-cloudy" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feGaussianBlur in="goo" stdDeviation="1.6" />
          </filter>
          {/* pinned to the viewBox so the deck's bottom row is exactly MIST_SEAM,
              the colour the band below the mist opens on */}
          <linearGradient id="mt-cloud-near" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="170">
            <stop offset="0" stopColor="#FAF5FF" />
            <stop offset="0.42" stopColor="#EFE6FC" />
            <stop offset="0.74" stopColor="#E6D8F9" />
            <stop offset="1" stopColor={MIST_SEAM} />
          </linearGradient>
          <linearGradient id="mt-cloud-mid" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="220">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C8AEEF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="mt-cloud-far" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="220">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
            <stop offset="1" stopColor="#DCCCF7" stopOpacity="0.16" />
          </linearGradient>
        </defs>
      </svg>

      <div className="menoid-grid pointer-events-none absolute inset-0 z-0 opacity-60" />

      {/* faint wisps drifting high in the sky */}
      <div className="cloud-band cloud-drift-rev left-0 top-[4%] z-[1]">
        <CloudStrip clouds={WISPS} gradient="mt-cloud-far" />
        <CloudStrip clouds={WISPS} gradient="mt-cloud-far" />
      </div>
      <div className="cloud-band cloud-drift-slow left-0 top-[46%] z-[1] hidden lg:flex">
        <CloudStrip clouds={WISPS} gradient="mt-cloud-far" />
        <CloudStrip clouds={WISPS} gradient="mt-cloud-far" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--violet)]">✦ Live on Monad &amp; Base ✦</p>
          <h2 className="font-round font-semibold tracking-[-0.02em] text-[var(--violet-deep)]" style={{ fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.05 }}>
            V1{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(100deg, #8D6DCC 0%, #B79BEE 50%, #7C5BD0 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Mainnet
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--violet-deep)]/65 sm:text-[15px]">
            The compliance-friendly multichain privacy layer, in your browser. Here is every step, exactly as the app shows it.
          </p>
        </Reveal>

        <div className="mt-20 flex flex-col gap-24 sm:mt-24 sm:gap-28">
          {STEPS.map((step, i) => (
            <StepRow key={step.id} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* ── the mist that closes the section ── */}
      <div className="relative z-[2] mt-28 h-[clamp(90px,13vw,170px)]">
        <div className="cloud-band cloud-drift-slow bottom-0 left-0 z-[1]">
          <CloudStrip clouds={MIST_BACK} gradient="mt-cloud-mid" />
          <CloudStrip clouds={MIST_BACK} gradient="mt-cloud-mid" />
        </div>
        <div className="cloud-band cloud-drift bottom-0 left-0 z-[2]">
          <CloudStrip clouds={MIST_FRONT} gradient="mt-cloud-near" floor />
          <CloudStrip clouds={MIST_FRONT} gradient="mt-cloud-near" floor />
        </div>
      </div>

      {/* the sky darkens from the mist's floor (MIST_SEAM) to Multichain's top
          (MODES_SEAM); -mt-px covers the mist strip's antialiased last row */}
      <div className="relative z-[3] -mt-px h-[clamp(48px,6vw,80px)]" style={{ background: `linear-gradient(180deg, ${MIST_SEAM} 0%, ${MODES_SEAM} 100%)` }} aria-hidden />
    </section>
  );
}
