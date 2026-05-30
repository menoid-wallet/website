"use client";

import { useEffect, useRef, useState } from "react";

export default function SectionTitle({
  eyebrow,
  title,
  highlight,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  highlight?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl ${className}`}
    >
      <p
        className={`font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--gold-deep)] transition-all duration-700 ${
          shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        ✦ {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-[clamp(36px,5vw,64px)] font-black leading-[1] tracking-[-0.02em] text-[var(--ink)] transition-all duration-1000 ${
          shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-[6px]"
        }`}
        style={{ transitionTimingFunction: "var(--ease-out-quart)" }}
      >
        {title}
        {highlight && (
          <span className={`underline-draw ml-3 inline-block ${shown ? "in" : ""}`}>
            <span
              className="italic font-display"
              style={{ color: "var(--gold-deep)" }}
            >
              {highlight}
            </span>
            <svg viewBox="0 0 320 18" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id={`u-${eyebrow.replace(/\s+/g, "-")}`} x1="0" x2="1">
                  <stop offset="0%"   stopColor="#a87808" />
                  <stop offset="50%"  stopColor="#d4a017" />
                  <stop offset="100%" stopColor="#f0d98b" />
                </linearGradient>
              </defs>
              <path
                className="underline-path"
                d="M2,12 C 80,2 160,18 318,8"
                stroke={`url(#u-${eyebrow.replace(/\s+/g, "-")})`}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
        )}
      </h2>
    </div>
  );
}
