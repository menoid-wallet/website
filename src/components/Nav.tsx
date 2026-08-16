"use client";

import { useState } from "react";
import MenoidWordmark from "./MenoidWordmark";
import CloudChip from "./CloudChip";
import AnimatedLogo from "./AnimatedLogo";
import { openDownload } from "./DownloadModal";

/* No bar — the nav is a row of little clouds floating in the hero's sky:
   one for the mark, one per link, one for the call to action. On a phone
   it drops to two: the mark and the menu opener.
   There is no scrolled state any more: the clouds carry their own shadow,
   so they read the same over the sky and over the sections below it. */

export default function Nav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#wallet-modes", label: "Modes" },
    { href: "#chains", label: "Chains" },
    // { href: "#meno", label: "Meno" },
    { href: "#roadmap", label: "Roadmap" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* the top padding has to clear each cloud's tallest lobe, or it gets
          sheared off against the top of the viewport */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-4 pt-7">
        {/* the mark */}
        <a href="#top" className="shrink-0">
          <CloudChip className="gap-2 px-3.5 py-1.5 transition-transform duration-300 hover:-translate-y-0.5">
            <AnimatedLogo
              className="h-10 w-10 sm:h-10 sm:w-10"
              style={{ filter: "drop-shadow(0 2px 4px rgba(64,36,122,0.28))" }}
            />
            <MenoidWordmark tone="violet" className="h-[15px] w-auto sm:h-[17px]" />
          </CloudChip>
        </a>

        {/* one cloud per link — the gap has to clear each cloud's lobes, or
            neighbouring clouds read as one lumpy mass */}
        <nav className="hidden items-center gap-4 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              <CloudChip className="px-4 py-1.5 transition-transform duration-300 hover:-translate-y-0.5">
                <span className="font-round text-[13px] font-semibold text-[var(--violet-deep)]">{l.label}</span>
              </CloudChip>
            </a>
          ))}
        </nav>

        {/* the call to action, in a cloud of its own */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* opens the sheet in place — it used to scroll to the closing
              section, which meant a whole page of travel to reach the same
              two builds */}
          <button type="button" onClick={openDownload} className="hidden md:inline-flex">
            <CloudChip tone="violet" className="px-4 py-1.5 transition-transform duration-300 hover:-translate-y-0.5">
              <span className="font-round text-[13px] font-semibold text-white">Download</span>
            </CloudChip>
          </button>

          {/* the opener */}
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu" id="mobile-menu-btn" className="md:hidden">
            <CloudChip className="px-3 py-2">
              <span className="block space-y-[5px]">
                <span
                  className="block h-[1.5px] w-4 transition-all duration-300"
                  style={{
                    background: "var(--violet-deep)",
                    ...(open ? { transform: "translateY(3.25px) rotate(45deg)" } : {}),
                  }}
                />
                <span
                  className="block h-[1.5px] w-4 transition-all duration-300"
                  style={{
                    background: "var(--violet-deep)",
                    ...(open ? { transform: "translateY(-3.25px) rotate(-45deg)" } : {}),
                  }}
                />
              </span>
            </CloudChip>
          </button>
        </div>
      </div>

      {/* Mobile menu — the links as their own little clouds, stacked */}
      {open && (
        <div className="mx-auto flex max-w-6xl flex-col items-end gap-4 px-4 pt-2 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <CloudChip className="px-4 py-1.5">
                <span className="font-round text-[13px] font-semibold text-[var(--violet-deep)]">{l.label}</span>
              </CloudChip>
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openDownload();
            }}
          >
            <CloudChip tone="violet" className="px-4 py-1.5">
              <span className="font-round text-[13px] font-semibold text-white">Download</span>
            </CloudChip>
          </button>
        </div>
      )}
    </header>
  );
}
