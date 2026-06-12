"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#chains", label: "Chains" },
    { href: "#wallet-modes", label: "Modes" },
    { href: "#waitlist", label: "Waitlist" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500`}
          style={{
            background: scrolled
              ? "rgba(251,241,217,0.85)"
              : "transparent",
            backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
            border: scrolled
              ? "1px solid rgba(163,110,20,0.18)"
              : "1px solid transparent",
            boxShadow: scrolled
              ? "0 2px 20px rgba(163,110,20,0.10), 0 1px 0 rgba(255,255,255,0.6) inset"
              : "none",
          }}
        >
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2.5">
            <div
              className="relative h-8 w-8 overflow-hidden rounded-full"
              style={{
                background: "linear-gradient(135deg, #FBF1D9, #F4E7CC)",
                boxShadow: "0 0 0 1px rgba(163,110,20,0.25), var(--shadow-xs)",
              }}
            >
              <Image src="/meno-hat.png" alt="" fill sizes="32px" className="object-contain p-0.5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              Menoid
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-xl px-3.5 py-1.5 text-sm font-medium text-[var(--ink-soft)] transition-all duration-300 hover:bg-[rgba(163,110,20,0.08)] hover:text-[var(--ink)]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <a
              href="#waitlist"
              className="btn-spring hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold md:inline-flex"
              style={{
                background: "linear-gradient(135deg, #A36E14 0%, #C8920E 50%, #E8AE3A 100%)",
                color: "#FBF1D9",
                boxShadow: "0 0 0 1px rgba(163,110,20,0.4), 0 4px 18px rgba(200,146,14,0.25), 0 1px 0 rgba(255,255,255,0.25) inset",
              }}
            >
              Join Waitlist
            </a>

            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              id="mobile-menu-btn"
              className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line-md)] md:hidden"
              style={{ background: "rgba(251,241,217,0.6)" }}
            >
              <span className="space-y-[5px]">
                <span className="block h-[1.5px] w-4 bg-[var(--ink)] transition-all duration-300"
                  style={open ? { transform: "translateY(6.5px) rotate(45deg)" } : {}} />
                <span className="block h-[1.5px] w-4 bg-[var(--ink)] transition-all duration-300"
                  style={open ? { transform: "translateY(-6.5px) rotate(-45deg)" } : {}} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            className="mt-2 rounded-2xl p-3 md:hidden"
            style={{
              background: "rgba(251,241,217,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(163,110,20,0.18)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[rgba(163,110,20,0.08)] hover:text-[var(--ink)] transition-colors">
                {l.label}
              </a>
            ))}
            <a href="#waitlist" onClick={() => setOpen(false)}
              className="mt-1.5 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #A36E14, #C8920E, #E8AE3A)",
                color: "#FBF1D9",
              }}>
              Join Waitlist
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
