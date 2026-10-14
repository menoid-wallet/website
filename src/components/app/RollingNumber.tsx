"use client";

import { useEffect, useState } from "react";

/* ────────────────────────────────────────────────────────────
   A value as a row of digit columns that roll like an odometer
   when it changes (the extension's AnimatedNumber). Non-digits
   ("$", ",", ".") stay put so the decimal point never jumps.
   ──────────────────────────────────────────────────────────── */

export default function RollingNumber({
  value,
  height = 36,
  className = "",
  duration = 700,
  widthRatio = 0.58,
}: {
  value: string;
  height?: number;
  className?: string;
  duration?: number;
  widthRatio?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span className={`inline-flex items-baseline ${className}`} style={{ lineHeight: `${height}px` }} aria-label={value}>
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${i}-d`} aria-hidden className="inline-block overflow-hidden align-baseline" style={{ height, width: Math.round(height * widthRatio) }}>
            <span
              className="block will-change-transform"
              style={{
                transform: `translateY(-${(mounted ? Number(ch) : 0) * height}px)`,
                transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n} className="block text-center tabular-nums" style={{ height, lineHeight: `${height}px` }}>
                  {n}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`${i}-s`} aria-hidden className="inline-block" style={{ height, lineHeight: `${height}px` }}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}
