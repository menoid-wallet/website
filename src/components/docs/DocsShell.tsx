"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AnimatedLogo from "@/components/AnimatedLogo";
import MenoidWordmark from "@/components/MenoidWordmark";
import { RainStyles } from "@/components/Rain";
import { APP_URL, HOME_URL } from "@/lib/links";
import { ACCENT, BUTTON, GLASS } from "./kit";
import { BOOKS, bookFromPath, counterpart, docsPath, pageHref, pageNumber, slugFromPath, type DocBook } from "./pages";

/* ────────────────────────────────────────────────────────────
   /docs — the frame every docs page shares (it lives in the
   docs layout, so it stays put while pages change): Noid
   mode's storm sky (fixed, with rain), a header with the
   version switcher, the list of pages beside the text, and a
   phone version of that list under the header. Which version
   and page are open comes from the URL.
   ──────────────────────────────────────────────────────────── */

/* Rain over the whole page: seeded (mulberry32) so the server and the client
   lay out the same drops — Math.random here is a hydration mismatch. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DROPS = (() => {
  const rnd = seeded(20260721);
  return Array.from({ length: 46 }, () => {
    const speed = rnd();
    return {
      left: rnd() * 100,
      top: rnd() * 100,
      len: 12 + speed * 22,
      opacity: 0.08 + speed * 0.16,
      duration: 0.95 + (1 - speed) * 0.9,
      delay: rnd() * -2.4,
    };
  });
})();

function Sky() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="bg-menoid-noid absolute inset-0" />
      <div className="menoid-grid-noid absolute inset-0" />
      <div className="absolute inset-0 overflow-hidden">
        {DROPS.map((d, i) => (
          <span
            key={i}
            className="rain-drop"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              height: d.len,
              width: 1,
              opacity: d.opacity,
              animationDuration: `${d.duration}s`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Switcher({ book, slug, compact = false }: { book: DocBook; slug: string; compact?: boolean }) {
  return (
    <div className="flex items-center rounded-full p-1" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
      {Object.values(BOOKS).map((b) => {
        const active = b.id === book.id;
        // switching keeps your place when the other version has the same page
        const href = active ? pageHref(b, slug) : counterpart(book.id, slug).href;
        return (
          <Link
            key={b.id}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 font-round text-[13px] font-semibold transition-colors sm:px-3.5 ${active ? "" : "text-white/70 hover:text-white"}`}
            style={active ? BUTTON : undefined}
          >
            {compact ? b.short : b.label}
          </Link>
        );
      })}
    </div>
  );
}

function PageLinks({ book, slug }: { book: DocBook; slug: string }) {
  return (
    <nav className="space-y-0.5">
      {book.pages.map((p, i) => {
        const on = p.slug === slug;
        return (
          <Link
            key={p.slug || "start"}
            href={pageHref(book, p.slug)}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-3 rounded-[12px] px-3 py-2 text-[14px] transition-colors ${on ? "text-white" : "text-white/58 hover:bg-white/[0.05] hover:text-white/90"}`}
            style={on ? { background: "rgba(255,255,255,0.09)", boxShadow: `inset 2px 0 0 ${ACCENT}` } : undefined}
          >
            <span className="w-5 shrink-0 font-mono text-[11px]" style={{ color: on ? ACCENT : "rgba(244,238,255,0.35)" }}>
              {pageNumber(i)}
            </span>
            <span className="font-round font-medium">{p.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DocsShell({ children }: { children: React.ReactNode }) {
  // on docs.menoid.xyz the URL leaves out /docs (next.config.ts): put it back
  const pathname = docsPath(usePathname() || "/docs");
  const book = bookFromPath(pathname);
  const slug = slugFromPath(book, pathname);
  const index = Math.max(0, book.pages.findIndex((p) => p.slug === slug));
  const other = counterpart(book.id, slug);
  const [openAt, setOpenAt] = useState<string | null>(null);
  // the phone list closes by itself when the page changes
  const open = openAt === pathname;

  /* Next.js scrolls a new page to the top as it mounts (before this runs: a
     child's mount comes first). Tell the smooth scroller (desktop) where the
     page is now, so a wheel glide still running from the last page can't
     carry the new one back down. */
  useLayoutEffect(() => {
    globalThis.__menoidLenis?.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [pathname]);

  return (
    <div className="docs-root relative isolate min-h-screen w-full text-[#F4EEFF]">
      <RainStyles />
      <Sky />

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl" style={{ background: "rgba(29,17,64,0.62)" }}>
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link href={HOME_URL} className="flex shrink-0 items-center gap-2" aria-label="Menoid home">
              <AnimatedLogo className="h-9 w-9" />
              <MenoidWordmark tone="light" className="hidden h-[15px] w-auto sm:block" />
            </Link>
            <span className="h-5 w-px bg-white/20" />
            <Link href={book.base} className="font-round text-[15px] font-semibold text-white/85 hover:text-white">
              Docs
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block">
              <Switcher book={book} slug={slug} />
            </div>
            <div className="sm:hidden">
              <Switcher book={book} slug={slug} compact />
            </div>
            <Link href={APP_URL} className="hidden rounded-full px-4 py-2 font-round text-[13px] font-semibold transition-transform hover:-translate-y-0.5 md:inline-flex" style={BUTTON}>
              Launch app
            </Link>
          </div>
        </div>

        {/* phone: the list of pages, one tap away */}
        <div className="border-t border-white/[0.07] lg:hidden">
          <button
            onClick={() => setOpenAt(open ? null : pathname)}
            className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-2.5 sm:px-6"
            aria-expanded={open}
          >
            <span className="flex min-w-0 items-center gap-2 text-[13.5px]">
              <span className="font-round text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">{book.short} docs</span>
              <span className="font-mono text-[11px]" style={{ color: ACCENT }}>
                {pageNumber(index)}
              </span>
              <span className="truncate font-round font-medium text-white/90">{book.pages[index].label}</span>
            </span>
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
              <path d="M2 3.5 5 6.5 8 3.5" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {open && (
            <div className="max-h-[60vh] overflow-y-auto px-2 pb-3" data-lenis-prevent>
              <PageLinks book={book} slug={slug} />
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 pb-24 sm:px-6 lg:grid lg:grid-cols-[236px_minmax(0,1fr)] lg:gap-12">
        {/* desktop: the list of pages */}
        <aside className="hidden lg:block">
          <div className="sticky top-[88px] max-h-[calc(100vh-108px)] overflow-y-auto pb-6 pt-10" data-lenis-prevent>
            <p className="mb-1 px-3 font-round text-[10px] font-bold uppercase tracking-[0.4em] text-white/45">{book.label}</p>
            <p className="mb-4 px-3 text-[12.5px] text-white/45">{book.sub}</p>
            <PageLinks book={book} slug={slug} />
            <div className="mt-6 rounded-[18px] p-3.5" style={GLASS}>
              <p className="text-[12.5px] leading-[1.5] text-white/60">Reading about {book.short}?</p>
              <Link href={other.href} className="mt-1 inline-block font-round text-[13.5px] font-semibold" style={{ color: ACCENT }}>
                Switch to {other.book.label} →
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 max-w-[820px]">{children}</main>
      </div>

      <footer className="relative z-10 border-t border-white/10" style={{ background: "rgba(16,9,38,0.55)" }}>
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2.5">
            <AnimatedLogo className="h-8 w-8" />
            <p className="text-[13.5px] text-white/60">Menoid — the compliance-friendly multichain privacy layer.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-round text-[13.5px] font-medium">
            <Link href={HOME_URL} className="text-white/70 hover:text-white">
              Home
            </Link>
            <Link href={APP_URL} className="text-white/70 hover:text-white">
              Launch app
            </Link>
            <Link href={other.book.base} className="text-white/70 hover:text-white">
              {other.book.label} docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
