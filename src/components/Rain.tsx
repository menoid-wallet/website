"use client";

/* ────────────────────────────────────────────────────────────
   RAIN — falling over the roadmap and the waitlist that closes it.
   Two layers: `far` sits behind the cards (thin, dim, slow) and
   `near` sits in front of everything (brighter, blurred, quick),
   which is what sells the depth.

   Drops fall a fixed distance rather than the height of the
   section: the section is thousands of pixels tall, and a drop
   crossing all of it either crawls or blurs into a streak. They
   are seeded from a fixed number instead of Math.random so the
   server and the client lay out the same drops — a random one
   here is a hydration mismatch.
   ──────────────────────────────────────────────────────────── */

/* mulberry32 — small, fast, and identical on both sides of the render */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Drop = {
  left: number;
  top: number;
  len: number;
  width: number;
  opacity: number;
  duration: number;
  delay: number;
};

/* Tops are spread across the whole section, and each drop falls further than
   the gap to the next one, so there is no band where the rain thins out. */
function makeDrops(count: number, seed: number, near: boolean): Drop[] {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => {
    const speed = rnd();
    return {
      left: rnd() * 100,
      top: rnd() * 100,
      len: near ? 26 + speed * 40 : 14 + speed * 26,
      width: near ? 1.6 : 1.1,
      opacity: near ? 0.26 + speed * 0.3 : 0.14 + speed * 0.24,
      duration: near ? 0.62 + (1 - speed) * 0.5 : 0.95 + (1 - speed) * 0.9,
      delay: rnd() * -2.4,
    };
  });
}

const FAR = makeDrops(120, 20260718, false);
const NEAR = makeDrops(34, 987654321, true);

function Layer({ drops, className }: { drops: Drop[]; className: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`} aria-hidden>
      {drops.map((d, i) => (
        <span
          key={i}
          className="rain-drop"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            height: d.len,
            width: d.width,
            opacity: d.opacity,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Both layers start below the top of the section, so no drop ever falls through
   open sky above the cloud ceiling — rain comes out of a cloud or it looks
   wrong. The offsets are in vw because the ceiling is: a .cloud-band strip
   keeps its 1400:220 ratio at the section's full width, so its bellies hang
   ~15vw down (~30vw under 768px, where the band doubles its width).

   The far layer starts *inside* that, and is left behind the near ceiling in z
   so the cloud masks the top of every drop — they appear out of the silhouette
   rather than at a line under it. The near layer is in front of everything, so
   it has to clear the bellies outright. */
export function RainFar() {
  return <Layer drops={FAR} className="top-[18vw] z-[1] md:top-[9vw]" />;
}

export function RainNear() {
  return <Layer drops={NEAR} className="top-[31vw] z-[30] blur-[1.2px] md:top-[15.5vw]" />;
}

export function RainStyles() {
  return (
    <style>{`
      .rain-drop {
        position: absolute;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%);
        animation-name: rain-fall;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        will-change: transform;
      }
      /* the small sideways drift is what stops it reading as a barcode */
      @keyframes rain-fall {
        from { transform: translate3d(0, -60px, 0); }
        to   { transform: translate3d(22px, 260px, 0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .rain-drop { display: none; }
      }
    `}</style>
  );
}
