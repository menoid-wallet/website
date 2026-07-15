"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import MenoidWordmark from "./MenoidWordmark";

/* The nav rides on the purple sky: bare over the hero, then it condenses
   into a cloud once you scroll. One identity the whole way down — the
   cloud reads cleanly over both the light and dark sections below. */

/* The lobes that turn the bar into a cloud: [left%, width%, height px, edge].
   Width is a percentage so they keep their proportions at any nav width —
   round lobes on a bar this wide read as a cog, wide overlapping ones read
   as cloud. They are opaque and share the body's colour, so they merge into
   one silhouette with no seams; the drop-shadow on the wrapper then traces
   the union rather than any single piece. Sizes are deliberately uneven. */
const LOBES: [number, number, number, "top" | "bottom"][] = [
  [7, 15, 52, "top"], [21, 18, 64, "top"], [36, 14, 48, "top"], [50, 17, 60, "top"],
  [64, 14, 50, "top"], [78, 18, 62, "top"], [92, 14, 46, "top"],
  [10, 16, 50, "bottom"], [25, 14, 44, "bottom"], [40, 17, 56, "bottom"],
  [55, 14, 46, "bottom"], [69, 17, 54, "bottom"], [84, 15, 48, "bottom"], [95, 12, 40, "bottom"],
];

const CLOUD = "#F4ECFF";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 32);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "#wallet-modes", label: "Modes" },
    { href: "#chains", label: "Chains" },
    // { href: "#meno", label: "Meno" },
    { href: "#roadmap", label: "Roadmap" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* the top padding has to clear the cloud's tallest lobe, or it gets
          sheared off against the top of the viewport */}
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-8">
        <div className="relative flex items-center justify-between px-4 py-2.5 sm:px-6">
          {/* ── the cloud the bar sits in ── */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: scrolled ? 1 : 0,
              filter: "drop-shadow(0 10px 22px rgba(64,36,122,0.30))",
            }}
          >
            {LOBES.map(([left, width, height, edge], i) => (
              <span
                key={i}
                className="absolute rounded-[50%]"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  height,
                  background: CLOUD,
                  [edge]: -height * 0.4,
                  transform: "translateX(-50%)",
                }}
              />
            ))}
            {/* the body goes last so it covers where the lobes meet it */}
            <div className="absolute inset-0 rounded-full" style={{ background: CLOUD }} />
          </div>

          {/* Logo */}
          <a href="#top" className="relative z-10 flex items-center gap-2.5">
            <Image
              src="/menoid-logo.png"
              alt=""
              width={64}
              height={64}
              className="h-8 w-8"
              style={{ filter: "drop-shadow(0 3px 6px rgba(64,36,122,0.35))" }}
            />
            {/* over the hero the wordmark is pale ink on a pale corner of the
                sky, so it needs a shadow to hold its edge; on the cloud it
                doesn't */}
            <MenoidWordmark
              tone={scrolled ? "violet" : "light"}
              className="h-[19px] w-auto"
              style={{
                filter: scrolled ? "none" : "drop-shadow(0 2px 8px rgba(64,36,122,0.45))",
              }}
            />
          </a>

          {/* Desktop nav */}
          <nav className="relative z-10 hidden items-center gap-0.5 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300 ${
                  scrolled
                    ? "text-[var(--violet-deep)] hover:bg-[rgba(94,64,168,0.10)]"
                    : "nav-link-hero-hover text-white/80 hover:text-white"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="relative z-10 flex items-center gap-2">
            <a
              href="#waitlist"
              className="btn-spring hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 md:inline-flex"
              style={
                scrolled
                  ? {
                      background: "var(--violet-deep)",
                      color: "#FFFFFF",
                      boxShadow: "0 4px 14px rgba(64,36,122,0.32), 0 1px 0 rgba(255,255,255,0.25) inset",
                    }
                  : {
                      background: "#FFFFFF",
                      color: "var(--violet-deep)",
                      boxShadow: "0 4px 14px rgba(64,36,122,0.28), 0 1px 0 rgba(255,255,255,0.9) inset",
                    }
              }
            >
              Join Waitlist
            </a>

            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              id="mobile-menu-btn"
              className="grid h-9 w-9 place-items-center rounded-full transition-all duration-300 md:hidden"
              style={{
                background: scrolled ? "rgba(94,64,168,0.12)" : "rgba(255,255,255,0.16)",
                border: `1px solid ${scrolled ? "rgba(94,64,168,0.22)" : "rgba(255,255,255,0.28)"}`,
              }}
            >
              <span className="space-y-[5px]">
                <span
                  className="block h-[1.5px] w-4 transition-all duration-300"
                  style={{
                    background: scrolled ? "var(--violet-deep)" : "#fff",
                    ...(open ? { transform: "translateY(3.25px) rotate(45deg)" } : {}),
                  }}
                />
                <span
                  className="block h-[1.5px] w-4 transition-all duration-300"
                  style={{
                    background: scrolled ? "var(--violet-deep)" : "#fff",
                    ...(open ? { transform: "translateY(-3.25px) rotate(-45deg)" } : {}),
                  }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            className="mt-3 rounded-3xl p-3 transition-all duration-300 md:hidden"
            style={{
              background: "rgba(94, 64, 168, 0.92)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.20)",
              boxShadow: "0 18px 40px rgba(64,36,122,0.34)",
            }}
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="mt-1.5 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300"
              style={{
                background: "#FFFFFF",
                color: "var(--violet-deep)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              Join Waitlist
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
