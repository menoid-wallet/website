"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);

      const walletModes = document.getElementById("wallet-modes");
      const chains = document.getElementById("chains");
      const navY = 40;

      const isOver = (el: HTMLElement | null) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= navY && rect.bottom >= navY;
      };

      if (isOver(walletModes) || isOver(chains)) {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const links = [
    { href: "#chains", label: "Chains" },
    { href: "#wallet-modes", label: "Modes" },
    { href: "#waitlist", label: "Waitlist" },
  ];

  // Colors based on theme & scroll
  const isLight = theme === "light";
  
  const navBg = isLight
    ? (scrolled ? "#FBF1D9" : "transparent")
    : (scrolled ? "#171311" : "transparent");
    
  const navBorder = isLight
    ? (scrolled ? "1px solid rgba(163,110,20,0.18)" : "1px solid transparent")
    : (scrolled ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent");
    
  const navShadow = isLight
    ? (scrolled ? "0 2px 20px rgba(163,110,20,0.10), 0 1px 0 rgba(255,255,255,0.6) inset" : "none")
    : (scrolled ? "0 2px 20px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset" : "none");

  const brandText = (isLight || !scrolled) ? "text-[var(--ink)]" : "text-[#FBF1D9]";
  const linkText = (isLight || !scrolled) 
    ? "text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[rgba(163,110,20,0.08)]" 
    : "text-[rgba(251,241,217,0.75)] hover:text-[#FBF1D9] hover:bg-[rgba(255,255,255,0.08)]";

  const btnBg = (isLight || !scrolled) ? "var(--ink)" : "var(--bg)";
  const btnColor = (isLight || !scrolled) ? "var(--bg)" : "var(--ink)";
  const btnShadow = isLight
    ? "0 0 0 1px rgba(23,19,17,0.15), 0 4px 14px rgba(23,19,17,0.2), 0 1px 0 rgba(255,255,255,0.15) inset"
    : (scrolled 
        ? "0 0 0 1px rgba(255,255,255,0.2), 0 4px 14px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.3) inset"
        : "0 0 0 1px rgba(23,19,17,0.15), 0 4px 14px rgba(23,19,17,0.2), 0 1px 0 rgba(255,255,255,0.15) inset"
      );

  const menuToggleBg = (isLight || !scrolled) ? "rgba(251,241,217,0.6)" : "rgba(23,19,17,0.6)";
  const menuToggleBorder = (isLight || !scrolled) ? "1px solid var(--line-md)" : "1px solid rgba(255,255,255,0.15)";
  const menuToggleBarBg = (isLight || !scrolled) ? "bg-[var(--ink)]" : "bg-[#FBF1D9]";

  const mobileMenuBg = isLight ? "rgba(251,241,217,0.95)" : "rgba(23,19,17,0.95)";
  const mobileMenuBorder = isLight ? "1px solid rgba(163,110,20,0.18)" : "1px solid rgba(255,255,255,0.15)";
  const mobileBtnBg = isLight ? "var(--ink)" : "var(--bg)";
  const mobileBtnColor = isLight ? "var(--bg)" : "var(--ink)";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div
          className="relative flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 overflow-hidden"
          style={{
            background: navBg,
            backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
            border: navBorder,
            boxShadow: navShadow,
          }}
        >
          {/* Capsule Grid Blueprint */}
          {scrolled && (
            <div 
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                opacity: isLight ? 0.35 : 0.04,
                backgroundImage: isLight
                  ? "linear-gradient(to right, rgba(163,110,20,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163,110,20,0.15) 1px, transparent 1px)"
                  : "linear-gradient(to right, #FBF1D9 1px, transparent 1px), linear-gradient(to bottom, #FBF1D9 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          )}

          {/* Logo */}
          <a href="#top" className="relative z-10 flex items-center gap-2.5">
            <div
              className="relative h-8 w-8 overflow-hidden rounded-full"
              style={{
                background: "linear-gradient(135deg, #FBF1D9, #F4E7CC)",
                boxShadow: "0 0 0 1px rgba(163,110,20,0.25), var(--shadow-xs)",
              }}
            >
              <Image src="/meno-hat.png" alt="" fill sizes="32px" className="object-contain p-0.5" />
            </div>
            <span className={`font-display text-xl font-bold tracking-tight transition-colors duration-300 ${brandText}`}>
              Menoid
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="relative z-10 hidden items-center gap-0.5 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? (isLight
                        ? "rounded-xl text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[rgba(163,110,20,0.08)] border border-transparent"
                        : "rounded-xl text-[rgba(251,241,217,0.75)] hover:text-[#FBF1D9] hover:bg-[rgba(255,255,255,0.08)] border border-transparent"
                      )
                    : "rounded-full text-[var(--ink-soft)] nav-link-hero-hover"
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
              className="btn-spring hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold md:inline-flex transition-all duration-300"
              style={{
                background: btnBg,
                color: btnColor,
                boxShadow: btnShadow,
              }}
            >
              Join Waitlist
            </a>

            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              id="mobile-menu-btn"
              className="grid h-9 w-9 place-items-center rounded-xl md:hidden transition-all duration-300"
              style={{ 
                background: menuToggleBg,
                border: menuToggleBorder,
              }}
            >
              <span className="space-y-[5px]">
                <span className={`block h-[1.5px] w-4 transition-all duration-300 ${menuToggleBarBg}`}
                  style={open ? { transform: "translateY(6.5px) rotate(45deg)" } : {}} />
                <span className={`block h-[1.5px] w-4 transition-all duration-300 ${menuToggleBarBg}`}
                  style={open ? { transform: "translateY(-6.5px) rotate(-45deg)" } : {}} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            className="mt-2 rounded-2xl p-3 md:hidden transition-all duration-300"
            style={{
              background: mobileMenuBg,
              backdropFilter: "blur(24px)",
              border: mobileMenuBorder,
              boxShadow: "var(--shadow-md)",
            }}
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${linkText}`}>
                {l.label}
              </a>
            ))}
            <a href="#waitlist" onClick={() => setOpen(false)}
              className="mt-1.5 block rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300"
              style={{
                background: mobileBtnBg,
                color: mobileBtnColor,
                boxShadow: "0 0 0 1px rgba(23,19,17,0.1), 0 1px 0 rgba(255,255,255,0.1) inset",
              }}>
              Join Waitlist
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
