"use client";

import { useId } from "react";

/* ────────────────────────────────────────────────────────────
   The menoid wordmark — the crisp, settled state of the loader
   animation, as a static SVG. Same custom glyphs, same stroke
   weights, same ink gradient. Used anywhere the brand name is
   written (nav, footer, …) so the site never sets "menoid" in a
   regular font again.
   `tone` picks the ink: "light" for purple backgrounds, "violet"
   for light/cloud backgrounds.
   ──────────────────────────────────────────────────────────── */

export default function MenoidWordmark({
  className,
  style,
  tone = "light",
}: {
  className?: string;
  style?: React.CSSProperties;
  tone?: "light" | "violet";
}) {
  // unique per instance so two wordmarks on one page can't share ids
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ink = `wm-ink-${uid}`;

  return (
    <svg viewBox="-6 -104 1392 310" className={className} style={style} role="img" aria-label="menoid">
      <defs>
        <linearGradient id={ink} x1="0" y1="-115" x2="0" y2="205" gradientUnits="userSpaceOnUse">
          {tone === "light" ? (
            <>
              <stop offset="0" stopColor="#f0e9fe" />
              <stop offset=".48" stopColor="#d6c8f7" />
              <stop offset="1" stopColor="#c3b1f1" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#9576dd" />
              <stop offset=".48" stopColor="#7757c4" />
              <stop offset="1" stopColor="#5f41ad" />
            </>
          )}
        </linearGradient>
      </defs>

      <g fill="none" stroke={`url(#${ink})`} strokeWidth={60} strokeLinecap="round" strokeLinejoin="round">
        {/* m */}
        <path d="M 30 170 V 100 A 67.5 70 0 0 1 165 100 V 170 M 165 100 A 67.5 70 0 0 1 300 100 V 170" />
        {/* e — thinner ring and bar keep its counters open (matches the loader) */}
        <g transform="translate(368 0)">
          <path strokeWidth={56} d="M 158 90 C 157.5 81, 159.4 57.6, 150.9 49.1 A 72 72 0 1 0 145.3 156" />
          <path strokeWidth={44} d="M 36 96 H 158" />
        </g>
        {/* n */}
        <path transform="translate(606 0)" d="M 30 170 V 100 A 70 70 0 0 1 170 100 V 170" />
        {/* o */}
        <path transform="translate(844 0)" d="M 100 30 A 70 70 0 0 1 100 170 A 70 70 0 0 1 100 30" />
        {/* i */}
        <path transform="translate(1082 0)" d="M 30 170 V 30" />
        {/* d */}
        <path transform="translate(1180 0)" d="M 100 30 A 70 70 0 0 1 100 170 A 70 70 0 0 1 100 30 M 170 -66 V 170" />
      </g>

      {/* the i dot, with its specular highlight */}
      <g transform="translate(1082 0)">
        <circle cx="30" cy="-66" r="32" fill={`url(#${ink})`} />
        <circle cx="22" cy="-74" r="8.5" fill="#fff" opacity=".55" />
      </g>
    </svg>
  );
}
