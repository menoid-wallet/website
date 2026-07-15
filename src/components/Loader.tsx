"use client";

import { useEffect, useRef, useState } from "react";

/* ────────────────────────────────────────────────────────────
   MENOID — liquid wordmark loader.
   The word is poured: bubbles rise from below and fuse into the
   strokes through an SVG goo filter, then a crisp copy crossfades
   in and the whole word settles with a jelly wobble.
   Ported from menoid_animation/ — same geometry, same timings.
   ──────────────────────────────────────────────────────────── */

const T0 = 650; // background alone before anything happens
const PRE = 330; // first bubbles lead the drawing
const STAG = 135; // per-letter stagger

const TOTAL_MS = 3650; // pour + crossfade + jelly settle, then leave
const REDUCED_MS = 700;
const FADE_MS = 800; // loader fade-out

type Phase = "in" | "out" | "gone";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function Loader() {
  const [phase, setPhase] = useState<Phase>("in");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const lettersRef = useRef<SVGGElement | null>(null);
  const dropsRef = useRef<SVGGElement | null>(null);
  const overlayRef = useRef<SVGGElement | null>(null);
  const solidRef = useRef<SVGGElement | null>(null);
  const solidLettersRef = useRef<SVGGElement | null>(null);

  /* ── the pour ── */
  useEffect(() => {
    const svg = svgRef.current;
    const lettersG = lettersRef.current;
    const dropsG = dropsRef.current;
    const overlayG = overlayRef.current;
    const solidG = solidRef.current;
    const solidLettersG = solidLettersRef.current;
    if (!svg || !lettersG || !dropsG || !overlayG || !solidG || !solidLettersG) return;

    const NS = "http://www.w3.org/2000/svg";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const letters = [...lettersG.querySelectorAll<SVGGElement>(".letter")];
    // the specular glint and crisp final layers reuse the exact same glyph geometry
    const clones = letters.map((g) => {
      const c = g.cloneNode(true) as SVGGElement;
      overlayG.appendChild(c);
      return c;
    });
    const solidClones = letters.map((g) => {
      const c = g.cloneNode(true) as SVGGElement;
      solidLettersG.appendChild(c);
      return c;
    });

    const anims: Animation[] = [];
    const temps: SVGElement[] = [];
    const track = <T extends Animation>(a: T) => {
      anims.push(a);
      return a;
    };

    const circle = (r: number) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", String(r));
      c.setAttribute("class", "droplet");
      dropsG.appendChild(c);
      temps.push(c);
      return c;
    };

    // a blob that rises from below and gets absorbed exactly where (and when)
    // the stroke tip passes through (tx, ty)
    const droplet = (tx: number, ty: number, arriveAt: number) => {
      const c = circle(rand(10, 26));
      const sx = tx + rand(-150, 150);
      const sy = rand(330, 470);
      let start = arriveAt - rand(520, 900);
      if (start < T0 + 30) start = T0 + 30;
      const dur = Math.max(240, arriveAt - start);
      const mx = (sx + tx) / 2 + rand(-45, 45);
      const my = sy * 0.45 + ty * 0.55;
      const a = track(
        c.animate(
          [
            { transform: `translate(${sx}px, ${sy}px) scale(0)`, offset: 0 },
            { transform: `translate(${sx}px, ${sy}px) scale(1)`, offset: 0.14 },
            { transform: `translate(${mx}px, ${my}px) scale(.92)`, offset: 0.6 },
            { transform: `translate(${tx}px, ${ty}px) scale(.12)`, offset: 1 },
          ],
          { duration: dur, delay: start, easing: "cubic-bezier(.33,.12,.24,1)", fill: "both" }
        )
      );
      a.finished.then(() => c.remove()).catch(() => {});
    };

    // ambient bubble that rises and pops without reaching a letter
    const bubble = (t: number) => {
      const c = circle(rand(5, 12));
      const x = rand(-30, 1404);
      const y1 = rand(390, 480);
      const y2 = rand(150, 300);
      const a = track(
        c.animate(
          [
            { transform: `translate(${x}px, ${y1}px) scale(0)` },
            { transform: `translate(${x + rand(-30, 30)}px, ${(y1 + y2) / 2}px) scale(1)`, offset: 0.55 },
            { transform: `translate(${x + rand(-50, 50)}px, ${y2}px) scale(0)` },
          ],
          { duration: rand(700, 1100), delay: t, easing: "ease-out", fill: "both" }
        )
      );
      a.finished.then(() => c.remove()).catch(() => {});
    };

    // a drop that swells on a bottom edge, detaches and falls
    const drip = (x: number, y: number, t: number) => {
      const c = circle(rand(8, 12));
      const a = track(
        c.animate(
          [
            { transform: `translate(${x}px, ${y + 14}px) scale(0)`, opacity: 1, easing: "ease-out" },
            { transform: `translate(${x}px, ${y + 24}px) scale(1)`, opacity: 1, offset: 0.4, easing: "cubic-bezier(.5,0,.9,.4)" },
            { transform: `translate(${x}px, ${y + 105}px) scale(.5)`, opacity: 1, offset: 0.9 },
            { transform: `translate(${x}px, ${y + 135}px) scale(.12)`, opacity: 0 },
          ],
          { duration: 1200, delay: t, fill: "both" }
        )
      );
      a.finished.then(() => c.remove()).catch(() => {});
    };

    if (reduce) {
      [...letters, ...clones, ...solidClones].forEach((g) => {
        g.querySelectorAll<SVGPathElement>("path.stroke").forEach((p) => (p.style.strokeDasharray = "none"));
        const d = g.querySelector<SVGGElement>(".dot");
        if (d) d.style.transform = "scale(1)";
      });
      solidG.style.opacity = "1";
    } else {
      let tEnd = 0;
      const dripSpots: { x: number; y: number }[] = [];

      letters.forEach((g, i) => {
        const ox = +(g.dataset.x ?? 0);
        const paths = [...g.querySelectorAll<SVGPathElement>("path.stroke")];
        const clonePaths = [...clones[i].querySelectorAll<SVGPathElement>("path.stroke")];
        const lens = paths.map((p) => p.getTotalLength());
        const dur = Math.max(560, Math.max(...lens) * 0.75);
        const start = T0 + PRE + i * STAG;

        paths.forEach((p, j) => {
          const len = lens[j];
          [p, clonePaths[j]].forEach((q) => {
            q.style.strokeDasharray = `${len} ${len + 80}`;
            track(
              q.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
                duration: dur,
                delay: start,
                easing: "cubic-bezier(.44,.05,.22,1)",
                fill: "both",
              })
            );
          });

          const n = Math.max(3, Math.round(len / 70));
          for (let k = 0; k < n; k++) {
            const f = Math.random();
            const pt = p.getPointAtLength(f * len);
            droplet(pt.x + ox, pt.y, start + f * dur);
          }

          for (let s = 0; s <= 30; s++) {
            const pt = p.getPointAtLength((len * s) / 30);
            if (pt.y > 160) dripSpots.push({ x: pt.x + ox, y: pt.y });
          }
        });

        [g, clones[i]].forEach((el) => {
          const d = el.querySelector<SVGGElement>(".dot");
          if (d)
            track(
              d.animate([{ transform: "scale(0)" }, { transform: "scale(1.3)", offset: 0.6 }, { transform: "scale(1)" }], {
                duration: 500,
                delay: start + dur * 0.8,
                easing: "cubic-bezier(.34,1.3,.5,1)",
                fill: "both",
              })
            );
        });

        tEnd = Math.max(tEnd, start + dur);
      });

      for (let k = 0; k < 16; k++) bubble(rand(T0, T0 + 1500));

      // swap the gooey word for the crisp copy once the pour is done
      track(solidG.animate([{ opacity: 0 }, { opacity: 1 }], { delay: tEnd, duration: 300, easing: "linear", fill: "both" }));
      track(lettersG.animate([{ opacity: 1 }, { opacity: 0 }], { delay: tEnd, duration: 300, easing: "linear", fill: "both" }));

      // jelly settle once the word is complete
      const jelly = [
        { transform: "scale(1,1)" },
        { transform: "scale(1.05,.93)", offset: 0.3 },
        { transform: "scale(.972,1.045)", offset: 0.6 },
        { transform: "scale(1.014,.99)", offset: 0.82 },
        { transform: "scale(1,1)" },
      ];
      [lettersG, overlayG, solidLettersG].forEach((el) =>
        track(el.animate(jelly, { duration: 840, delay: tEnd + 70, easing: "ease-in-out" }))
      );

      // a few drops slide off the fresh letters
      dripSpots.sort(() => Math.random() - 0.5);
      const picked: { x: number; y: number }[] = [];
      for (const s of dripSpots) {
        if (picked.every((p) => Math.abs(p.x - s.x) > 240)) picked.push(s);
        if (picked.length === 3) break;
      }
      picked.forEach((s, i) => drip(s.x, s.y, tEnd + 420 + i * 300));
    }

    return () => {
      anims.forEach((a) => a.cancel());
      temps.forEach((c) => c.remove());
      [...clones, ...solidClones].forEach((c) => c.remove());
    };
  }, []);

  /* ── loader lifecycle: hold the page, then hand over to the hero ── */
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const lenis = () => (globalThis as unknown as { __menoidLenis?: { stop(): void; start(): void } }).__menoidLenis;
    lenis()?.stop();

    const hold = matchMedia("(prefers-reduced-motion: reduce)").matches ? REDUCED_MS : TOTAL_MS;

    const outTimer = window.setTimeout(() => {
      setPhase("out");
      // Tell the hero (and anything else) the loader is done so its
      // entrance animation can play as the loader fades away.
      document.body.dataset.revealed = "true";
      window.dispatchEvent(new Event("menoid:revealed"));
    }, hold);

    const goneTimer = window.setTimeout(() => {
      setPhase("gone");
      document.documentElement.style.overflow = "";
      document.body.dataset.loaded = "true";
      lenis()?.start();
    }, hold + FADE_MS);

    return () => {
      window.clearTimeout(outTimer);
      window.clearTimeout(goneTimer);
      document.documentElement.style.overflow = "";
      lenis()?.start();
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden={phase !== "in"}
      className={`menoid-loader fixed inset-0 z-[100] overflow-hidden ${phase === "out" ? "opacity-0" : "opacity-100"}`}
      style={{ transition: `opacity ${FADE_MS - 100}ms ease` }}
    >
      <div className="ldr-grid" />

      <div className="ldr-stage">
        <svg ref={svgRef} id="ldr-logo" viewBox="-40 -150 1460 410" role="img" aria-label="menoid">
          <defs>
            <linearGradient id="ldr-ink" x1="0" y1="-115" x2="0" y2="205" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f0e9fe" />
              <stop offset=".48" stopColor="#d6c8f7" />
              <stop offset="1" stopColor="#c3b1f1" />
            </linearGradient>
            <linearGradient id="ldr-glint" x1="0" y1="-115" x2="0" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity=".7" />
              <stop offset=".45" stopColor="#fff" stopOpacity=".26" />
              <stop offset=".8" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <filter id="ldr-goo" x="-15%" y="-90%" width="130%" height="320%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -12" />
            </filter>
          </defs>

          <g filter="url(#ldr-goo)">
            <g ref={dropsRef} id="ldr-drops" />
            <g ref={lettersRef} id="ldr-letters">
              {/* custom letterforms: monoline glyphs, 200-unit x-height, 60-unit stroke */}
              <g className="letter" data-x="0" transform="translate(0 0)">
                <path className="stroke" d="M 30 170 V 100 A 67.5 70 0 0 1 165 100 V 170 M 165 100 A 67.5 70 0 0 1 300 100 V 170" />
              </g>
              <g className="letter" data-x="368" transform="translate(368 0)">
                {/* e: the ring leaves the 72-circle at ~1:30 (-45deg) and spirals
                    inward (tangent-continuous cubic) to end at (158,90), just above the
                    bar tip, so the bar's round cap is buried inside the ring's cap (one
                    smooth head, no crease) and the head cap's bottom (90+28=118) sits
                    exactly flush with the bar's underside — nothing crosses the bar line.
                    Tail terminal at ~4:40 (+51deg). Aperture gaps stay >= ~9 units, the
                    goo-blur fuse threshold, so the animating e and the final e match. */}
                <path className="stroke ering" d="M 158 90 C 157.5 81, 159.4 57.6, 150.9 49.1 A 72 72 0 1 0 145.3 156" />
                <path className="stroke ebar" d="M 36 96 H 158" />
              </g>
              <g className="letter" data-x="606" transform="translate(606 0)">
                <path className="stroke" d="M 30 170 V 100 A 70 70 0 0 1 170 100 V 170" />
              </g>
              <g className="letter" data-x="844" transform="translate(844 0)">
                <path className="stroke" d="M 100 30 A 70 70 0 0 1 100 170 A 70 70 0 0 1 100 30" />
              </g>
              <g className="letter" data-x="1082" transform="translate(1082 0)">
                <path className="stroke" d="M 30 170 V 30" />
                <g className="dot">
                  <circle className="dotfill" cx="30" cy="-66" r="32" />
                  <circle className="dothl" cx="22" cy="-74" r="8.5" />
                </g>
              </g>
              <g className="letter" data-x="1180" transform="translate(1180 0)">
                <path className="stroke" d="M 100 30 A 70 70 0 0 1 100 170 A 70 70 0 0 1 100 30 M 170 -66 V 170" />
              </g>
            </g>
          </g>

          {/* crisp, unfiltered copy of the word; crossfaded in once the pour ends
              so fine details (the e counters and aperture) are not eaten by the goo blur */}
          <g ref={solidRef} id="ldr-solid">
            <g ref={solidLettersRef} id="ldr-solid-letters" />
          </g>

          <g id="ldr-overlay" transform="translate(2 -12)">
            <g ref={overlayRef} id="ldr-overlay-letters" />
          </g>
        </svg>
      </div>

      <style>{`
        .menoid-loader {
          user-select: none;
          -webkit-user-select: none;
          background:
            radial-gradient(135% 115% at 100% 0%, rgba(246, 229, 253, .92) 0%, rgba(246, 229, 253, 0) 52%),
            radial-gradient(110% 85% at 0% 100%, rgba(78, 47, 142, .30) 0%, rgba(78, 47, 142, 0) 55%),
            linear-gradient(225deg, #d9bef4 0%, #b197e9 48%, #9a7fdd 100%);
        }

        /* the square grid of the backdrop */
        .menoid-loader .ldr-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255, 255, 255, .13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, .13) 1px, transparent 1px);
          background-size: 58px 58px;
        }

        .menoid-loader .ldr-stage {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
        }

        .menoid-loader #ldr-logo {
          margin-top: -5vh;
          width: clamp(300px, 63vw, 880px);
          overflow: visible;
          filter:
            drop-shadow(0 8px 10px rgba(84, 54, 160, .22))
            drop-shadow(0 26px 38px rgba(84, 54, 160, .32));
        }

        .menoid-loader path.stroke {
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          /* hidden until the draw animation takes over */
          stroke-dasharray: 0 99999;
        }

        .menoid-loader #ldr-letters path.stroke { stroke: url(#ldr-ink); stroke-width: 60; }
        /* the e keeps a slightly thinner ring and crossbar so its counters
           and aperture stay open */
        .menoid-loader #ldr-letters path.ering { stroke-width: 56; }
        .menoid-loader #ldr-letters path.ebar { stroke-width: 44; }

        /* crisp final word, revealed after the liquid settles */
        .menoid-loader #ldr-solid { opacity: 0; }
        .menoid-loader #ldr-solid path.stroke { stroke: url(#ldr-ink); stroke-width: 60; stroke-dasharray: none; }
        /* the e overrides must stay AFTER the #ldr-solid base rule above — equal
           specificity, so source order decides; before it they silently lose */
        .menoid-loader #ldr-solid path.ering { stroke-width: 56; }
        .menoid-loader #ldr-solid path.ebar { stroke-width: 44; }
        .menoid-loader #ldr-solid .dothl { display: none; }
        .menoid-loader #ldr-solid .dot { transform: scale(1); }

        /* thin specular glint drawn outside the goo filter so it stays crisp;
           its gradient fades to zero low on the glyphs so only top edges shine */
        .menoid-loader #ldr-overlay path.stroke { stroke: url(#ldr-glint); stroke-width: 13; }
        .menoid-loader #ldr-letters .dothl { display: none; }
        .menoid-loader #ldr-overlay .dotfill { display: none; }

        .menoid-loader .dotfill { fill: url(#ldr-ink); }
        .menoid-loader .dothl { fill: #fff; opacity: .55; }

        .menoid-loader .dot {
          transform: scale(0);
          transform-box: fill-box;
          transform-origin: center;
        }

        .menoid-loader .droplet {
          fill: url(#ldr-ink);
          transform-box: fill-box;
          transform-origin: center;
        }

        .menoid-loader #ldr-letters,
        .menoid-loader #ldr-overlay-letters,
        .menoid-loader #ldr-solid-letters {
          transform-box: fill-box;
          transform-origin: 50% 100%;
        }
      `}</style>
    </div>
  );
}
