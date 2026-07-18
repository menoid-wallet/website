"use client";

import Reveal from "./Reveal";
import { HERO_SEAM, MIST_SEAM, MODES_SEAM } from "./seams";

/* ────────────────────────────────────────────────────────────
   WALLET MODES — above the cloud line.
   A pale lilac sky carried over from the bottom of the hero. Clouds
   all the way down: banks drifting as atmosphere, and every card a
   cloud of its own (see CardCloud). Open Mode is lit and pale; from
   the mist onward the sky turns plainly violet and Noid Mode rises
   out of it.

   Two seams have to be invisible, and both work the same way: a cloud
   deck bottoms out on a known colour, and whatever sits below it opens
   on that same colour. `HERO_SEAM` is the hero's; `MIST_SEAM` is the
   mist bank's, which the Noid block below it starts from. See seams.ts.
   ──────────────────────────────────────────────────────────── */

type Item = {
  title: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
};

const wallet = (
  <>
    <path d="M19.5 8.5V7.2A2.2 2.2 0 0 0 17.3 5H5.2A2.2 2.2 0 0 0 3 7.2v9.6A2.2 2.2 0 0 0 5.2 19h12.1a2.2 2.2 0 0 0 2.2-2.2v-1.3" />
    <path d="M20.4 9.6h-3.6a2.4 2.4 0 0 0 0 4.8h3.6a.9.9 0 0 0 .9-.9v-3a.9.9 0 0 0-.9-.9z" />
  </>
);
const globe = (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.2 2.3 3.3 5.2 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.2-3.3-8.5S9.8 5.8 12 3.5z" />
  </>
);
const shield = (
  <>
    <path d="M12 3.2l7 2.8v5.6c0 4.1-2.9 7.6-7 9.2-4.1-1.6-7-5.1-7-9.2V6z" />
    <path d="M9.3 12.2l1.9 1.9 3.5-3.7" />
  </>
);
const transfer = (
  <>
    <path d="M4 9h13" />
    <path d="M13.5 5.5L17 9l-3.5 3.5" />
    <path d="M20 15H7" />
    <path d="M10.5 11.5L7 15l3.5 3.5" />
  </>
);
const reveal = (
  <>
    <path d="M2.8 12S6.3 6.2 12 6.2 21.2 12 21.2 12 17.7 17.8 12 17.8 2.8 12 2.8 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </>
);
const layers = (
  <>
    <path d="M12 3.2l8.4 4.6-8.4 4.6-8.4-4.6z" />
    <path d="M3.6 12.4l8.4 4.6 8.4-4.6" />
    <path d="M3.6 16.6l8.4 4.6 8.4-4.6" />
  </>
);

const OPEN_MODE: Item[] = [
  {
    title: "Create Your Wallet",
    description: "Generate your wallet in seconds and start exploring the ecosystem with a familiar public account.",
    bullets: ["Secure local key generation", "Supports 15+ blockchain networks", "Ready for everyday crypto"],
    icon: wallet,
  },
  {
    title: "Explore Publicly",
    description: "Send, swap, bridge, and connect with your favorite apps just like any standard wallet.",
    bullets: ["Public transfers & swaps", "Connect to any supported dApp", "Transparent on-chain history"],
    icon: globe,
  },
];

const NOID_MODE: (Item & { eyebrow: string })[] = [
  {
    eyebrow: "Shield",
    title: "Shield Your Assets",
    description: "Move tokens into the Noid Pool to separate them from your public wallet. Your assets remain fully under your control while becoming unlinkable from your on-chain identity.",
    bullets: ["Shield supported assets", "Zero-knowledge protected balances", "Break public wallet links", "You remain the only owner"],
    icon: shield,
  },
  {
    eyebrow: "Transfer",
    title: "Private Transfers",
    description: "Send assets without revealing who sent them, who received them, or how much was transferred. Every transfer is verified using zero-knowledge proofs instead of public transaction history.",
    bullets: ["Private sender & receiver", "Hidden transfer amounts", "Zero-knowledge verified", "Unlinkable transactions"],
    icon: transfer,
  },
  {
    eyebrow: "Reveal",
    title: "Return to Open Mode",
    description: "Withdraw your assets whenever you choose. Privacy isn't permanent — it's something you control.",
    bullets: ["Withdraw anytime", "Send to any wallet", "No waiting periods", "Switch modes instantly"],
    icon: reveal,
  },
  {
    eyebrow: "Interact",
    title: "Private On-Chain Activity",
    description: "Go beyond private balances. Swap, bridge, stake, and interact through Noid Mode while keeping your activity separated from your public identity.",
    bullets: ["Private swaps", "Private bridges", "Private DeFi positions", "Across 15+ chains"],
    icon: layers,
  },
];

/* ── Clouds ──
   Overlapping puffs fused by a goo filter (blur, then crank the alpha
   contrast) — the only way to get one smooth silhouette out of separate
   circles. Own id prefix so nothing collides with the hero's defs. */
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
      <g fill={`url(#${gradient})`} filter="url(#wm-cloudy)">
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px]">
      <svg
        className="mt-[3px] h-3.5 w-3.5 shrink-0"
        style={{ color: "var(--logo-line)" }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="leading-relaxed text-[var(--violet-deep)]/75">{children}</span>
    </li>
  );
}

/* ── the card, as a cloud ──
   Same idea as the Multichain cloud: puffs fused by the goo filter. The
   difference is that this one has to hold a paragraph and a bullet list, and
   how tall that runs depends on the copy — so the strip stretches with
   `preserveAspectRatio="none"` rather than keeping its ratio. The puffs are
   drawn a little flat for that reason; a card is always taller than the
   viewBox's 4:3, so they are stretched back towards round on the way out.

   A solid body under the puffs is what makes this usable as a text box: it
   guarantees the middle is filled whatever the stretch, and the content's
   percentage padding keeps every line inside it. */
/* The body is pulled well inside the ring of puffs — far enough that every
   edge of the silhouette is a puff and none of it is the rect. Let a rect edge
   reach the outline anywhere and you get a straight run down the side of the
   cloud, which is the one thing that stops it reading as one.

   Sizes vary hard on purpose too: a dozen bumps of the same radius spaced
   evenly round the edge is a doily, not a cloud. */
const CARD_BODY = { x: 90, y: 100, w: 220, h: 100 };
const CARD_PUFFS: [number, number, number][] = [
  // top: one big crown with a shoulder either side
  [118, 84, 56], [208, 62, 76], [292, 86, 58],
  // two lobes to a side — enough to enclose the body, few enough to stay cloud
  [66, 148, 56], [90, 210, 52],
  [334, 148, 56], [310, 206, 52],
  // bottom: longer and flatter than the top, as a cloud's underside is
  [134, 224, 60], [222, 234, 68],
];

function CardCloud({ tone }: { tone: "open" | "noid" }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      // Carries more weight than it looks like it should: Noid's cards now sit
      // almost on their own sky, so this shadow — not a step in fill colour —
      // is what holds the silhouette.
      style={{ filter: "drop-shadow(0 20px 34px rgba(78,47,142,0.26))" }}
      aria-hidden
      focusable="false"
    >
      <g fill={`url(#wm-card-${tone})`} filter="url(#wm-cloudy)">
        <rect x={CARD_BODY.x} y={CARD_BODY.y} width={CARD_BODY.w} height={CARD_BODY.h} />
        {CARD_PUFFS.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}

function ModeCard({
  item,
  index,
  tone,
  eyebrow,
}: {
  item: Item;
  index: number;
  tone: "open" | "noid";
  eyebrow?: string;
}) {
  return (
    <div className="wm-card group relative flex h-full flex-col">
      <CardCloud tone={tone} />

      {/* The padding is what keeps the copy off the scalloped edge. It is a
          percentage on both axes — in CSS that resolves against the width for
          padding-block too, which is what we want: the wider the card, the
          wider its lobes, and the further in the text has to start. */}
      <div className="relative flex h-full flex-col items-center px-[13%] py-[12%] text-center">
        <span
          className="grid h-11 w-11 place-items-center rounded-[14px]"
          style={{
            background:
              tone === "noid"
                ? "linear-gradient(160deg, #8E6FE0 0%, #5E40A8 100%)"
                : "linear-gradient(160deg, #C3ACF3 0%, #8D6DCC 100%)",
            boxShadow: "0 8px 18px rgba(84,52,150,0.3), 0 1px 0 rgba(255,255,255,0.45) inset",
          }}
        >
          <svg
            className="h-[21px] w-[21px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {item.icon}
          </svg>
        </span>

        <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--violet-deep)]/45">
          {eyebrow ? `${eyebrow} · ` : ""}0{index + 1}
        </span>

        <h4 className="font-round mt-2 text-[20px] font-semibold leading-snug text-[var(--violet-deep)]">
          {item.title}
        </h4>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--violet-deep)]/70">{item.description}</p>

        {/* the list is left-aligned, but centred as a block — ragged-left
            bullets inside a round silhouette look like a mistake */}
        <ul className="mt-5 inline-block space-y-2.5 pt-4 text-left" style={{ borderTop: "1px solid rgba(141,109,204,0.2)" }}>
          {item.bullets.map((b) => (
            <Bullet key={b}>{b}</Bullet>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ModeHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <Reveal className="mb-12 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--violet)]">{eyebrow}</p>
      <h3
        className="font-round mt-2.5 font-semibold tracking-[-0.02em] text-[var(--violet-deep)]"
        style={{ fontSize: "clamp(26px, 3.4vw, 40px)" }}
      >
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--violet-deep)]/65 sm:text-[15px]">
        {subtitle}
      </p>
    </Reveal>
  );
}

export default function WalletModes() {
  return (
    <section
      id="wallet-modes"
      // opens on the hero's deck colour — the clouds above simply keep going
      className="relative isolate overflow-hidden pt-24 sm:pt-28"
      style={{
        background: `linear-gradient(180deg, ${HERO_SEAM} 0%, #EDE4FC 34%, #F3ECFE 66%, #E9DFFB 100%)`,
      }}
    >
      {/* cloud paint + the goo that fuses the puffs */}
      <svg className="absolute h-0 w-0" aria-hidden focusable="false">
        <defs>
          <filter id="wm-cloudy" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feGaussianBlur in="goo" stdDeviation="1.6" />
          </filter>
          {/* Pinned to the viewBox (see Hero) so the last stop is exactly the
              colour of the deck's bottom row — which is what the Noid block
              below opens on.

              It ends at y=170 rather than 220, which is where the deck starts:
              past the last stop a gradient pads, so the whole deck is flat
              MIST_SEAM. Running the ramp all the way to 220 instead puts a
              fast colour change in the deck's 50px and a slow one in the 1300px
              of Noid below, and the eye reads that jump in *rate* as an edge
              even though the two colours either side of it are identical. */}
          <linearGradient id="wm-cloud-near" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="170">
            {/* Never pure white. The Noid sky below is a lavender, and a bank
                that holds white most of the way down reads as a different
                material laid over it rather than as the same weather. Only the
                crowns stay bright; the rest is already on its way to
                MIST_SEAM. */}
            <stop offset="0" stopColor="#FAF5FF" />
            <stop offset="0.42" stopColor="#EFE6FC" />
            <stop offset="0.74" stopColor="#E6D8F9" />
            <stop offset="1" stopColor={MIST_SEAM} />
          </linearGradient>
          <linearGradient id="wm-cloud-mid" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="220">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="1" stopColor="#C8AEEF" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="wm-cloud-far" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="220">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
            <stop offset="1" stopColor="#DCCCF7" stopOpacity="0.16" />
          </linearGradient>
          {/* The cards. Open's sky is pale, so its clouds can stay near white;
              Noid's is a good deal deeper, and a white cloud on it reads as cut
              out and pasted on. Noid's bottom out close to the sky they sit in
              — only the lit crown separates, and the card's drop-shadow is what
              keeps the silhouette legible rather than a step in colour. */}
          <linearGradient id="wm-card-open" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#FAF6FF" />
            <stop offset="1" stopColor="#EDE3FC" />
          </linearGradient>
          <linearGradient id="wm-card-noid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FAF6FE" />
            <stop offset="0.5" stopColor="#EFE7FC" />
            <stop offset="1" stopColor="#DFCEF8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="menoid-grid pointer-events-none absolute inset-0 z-0 opacity-60" />

      {/* faint wisps drifting high in the sky */}
      <div className="cloud-band cloud-drift-rev left-0 top-[6%] z-[1]">
        <CloudStrip clouds={WISPS} gradient="wm-cloud-far" />
        <CloudStrip clouds={WISPS} gradient="wm-cloud-far" />
      </div>
      <div className="cloud-band cloud-drift-slow left-0 top-[58%] z-[1] hidden lg:flex">
        <CloudStrip clouds={WISPS} gradient="wm-cloud-far" />
        <CloudStrip clouds={WISPS} gradient="wm-cloud-far" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Intro */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--violet)]">
            ✦ One Wallet. Two Ways to Use Crypto. ✦
          </p>
          <h2
            className="font-round font-semibold tracking-[-0.02em] text-[var(--violet-deep)]"
            style={{ fontSize: "clamp(30px, 4.4vw, 54px)", lineHeight: 1.1 }}
          >
            One Address. Two Worlds.
            <br />
            {/* gradient fill rather than italic — Fredoka has no true italic and
                the synthesized oblique leans into the next word */}
            Public {" "}& {" "}
            <span
              style={{
                backgroundImage: "linear-gradient(100deg, #8D6DCC 0%, #B79BEE 50%, #7C5BD0 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Private
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--violet-deep)]/65 sm:text-[15px]">
            Use crypto like everyone else in Open Mode, then switch to Noid Mode whenever you want your balances, transfers, and interactions to stay private. No separate wallet. No complicated setup. Just privacy when you choose.
          </p>
        </Reveal>

        {/* ─────────────── OPEN MODE ─────────────── */}
        {/* its own anchor: the footer links to each mode separately, and
            #wallet-modes lands on the section intro, above both of them */}
        <div id="open-mode" className="mt-28 scroll-mt-24">
          <ModeHeader
            eyebrow="Mode 01 · Open"
            title="Open Mode"
            subtitle="Everything you expect from a modern crypto wallet — fast, familiar, and fully transparent."
          />
          <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-2 md:grid-cols-2">
            {OPEN_MODE.map((item, i) => (
              <Reveal key={item.title} className="h-full" delay={i * 110}>
                <ModeCard item={item} index={i} tone="open" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── the mist the Noid section rises out of ── */}
      <div className="relative z-[2] mt-28 h-[clamp(90px,13vw,170px)]">
        <div className="cloud-band cloud-drift-slow bottom-0 left-0 z-[1]">
          <CloudStrip clouds={MIST_BACK} gradient="wm-cloud-mid" />
          <CloudStrip clouds={MIST_BACK} gradient="wm-cloud-mid" />
        </div>
        {/* flush with the container's bottom edge — that edge is where the Noid
            block starts, so the deck's last row and the block's first row are
            the same colour and the deck simply carries on as the background */}
        <div className="cloud-band cloud-drift bottom-0 left-0 z-[2]">
          <CloudStrip clouds={MIST_FRONT} gradient="wm-cloud-near" floor />
          <CloudStrip clouds={MIST_FRONT} gradient="wm-cloud-near" floor />
        </div>
      </div>

      {/* ─────────────── NOID MODE ─────────────── */}
      {/* pb here rather than on the section: the section's own gradient would
          otherwise show below this block as a band with a hard top edge */}
      <div
        id="noid-mode"
        // -mt-px: the mist strip's height is fractional, so its last row is an
        // antialiased blend of the deck with the paler sky behind it, and that
        // shows as a fine light line even when the colours either side match.
        // Sitting a pixel higher (and above it in z) covers that row.
        className="relative z-[3] -mt-px scroll-mt-24 pb-28 pt-20"
        style={{ background: `linear-gradient(180deg, ${MIST_SEAM} 0%, #D6C0F5 45%, ${MODES_SEAM} 100%)` }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ModeHeader
            eyebrow="Mode 02 · Noid"
            title="Noid Mode"
            subtitle="A privacy layer built directly into your wallet. Shield assets, transfer privately, and interact without exposing your activity."
          />
          <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-2 md:grid-cols-2">
            {NOID_MODE.map((item, i) => (
              <Reveal key={item.title} className="h-full" delay={(i % 2) * 110}>
                <ModeCard item={item} index={i} tone="noid" eyebrow={item.eyebrow} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .wm-card { transition: transform 520ms var(--ease-out-quart); }
        .wm-card:hover { transform: translateY(-6px); }
        @media (prefers-reduced-motion: reduce) {
          .wm-card { transition: none; }
          .wm-card:hover { transform: none; }
        }
      `}</style>
    </section>
  );
}
