"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const links = [
  { href: "#features", label: "Modes" },
  { href: "#how", label: "How it works" },
  { href: "#chains", label: "Tech" },
  { href: "#learn", label: "Learn" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out-quart)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={`flex items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 ${
            scrolled
              ? "border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
          style={{
            transitionTimingFunction: "var(--ease-out-quart)",
            boxShadow: scrolled ? "var(--shadow-md)" : "none",
          }}
        >
          <a href="#top" className="flex items-center gap-2 pl-2">
            <div
              className="relative h-8 w-8 overflow-hidden rounded-full bg-[var(--bg-soft)] ring-1 ring-[var(--line)]"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              <Image
                src="/meno-hat.png"
                alt=""
                fill
                sizes="32px"
                className="object-contain p-0.5"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              Menoid
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-[var(--ink-soft)] transition-colors duration-300 hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#download"
              className="btn-spring hidden rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--bg)] md:inline-flex"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              Get Menoid
            </a>
            <button
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)] md:hidden"
            >
              <span className="space-y-1">
                <span className="block h-0.5 w-4 bg-[var(--ink)]" />
                <span className="block h-0.5 w-4 bg-[var(--ink)]" />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <div
            className="mt-2 rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-3 md:hidden"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] hover:bg-[var(--bg-soft)]"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#download"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-2xl bg-[var(--ink)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--bg)]"
            >
              Get Menoid
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
