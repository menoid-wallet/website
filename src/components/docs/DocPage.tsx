import Link from "next/link";

import { ACCENT, CHIP, GLASS } from "./kit";
import { locate, pageHref, pageNumber, type DocBook, type DocPage as Page, type DocVersion } from "./pages";

/* ────────────────────────────────────────────────────────────
   One docs page: its number, kicker and title (from pages.ts),
   the body, and the way on — previous and next — at the
   bottom. The first page of each version also carries the lit
   hero card above its title.
   ──────────────────────────────────────────────────────────── */

function Neighbour({ book, page, index, dir }: { book: DocBook; page: Page; index: number; dir: "prev" | "next" }) {
  const next = dir === "next";
  return (
    <Link
      href={pageHref(book, page.slug)}
      className={`group flex flex-col gap-1.5 rounded-[22px] px-5 py-4 transition-transform duration-300 hover:-translate-y-0.5 ${next ? "sm:col-start-2 sm:items-end sm:text-right" : ""}`}
      style={
        next
          ? { background: "linear-gradient(145deg, rgba(201,176,255,0.17), rgba(255,255,255,0.05))", border: "1px solid rgba(201,176,255,0.34)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" }
          : GLASS
      }
    >
      <span className="font-round text-[10.5px] font-bold uppercase tracking-[0.28em] text-white/45">{next ? "Next →" : "← Previous"}</span>
      <span className="flex items-baseline gap-2 font-round text-[17px] font-semibold text-white transition-colors group-hover:text-[#E6DAFF]">
        <span className="font-mono text-[12px] font-normal" style={{ color: ACCENT }}>
          {pageNumber(index)}
        </span>
        {page.label}
      </span>
      <span className="line-clamp-2 text-[13px] leading-[1.5] text-white/50">{page.description}</span>
    </Link>
  );
}

export default function DocPage({ version, slug, hero, children }: { version: DocVersion; slug: string; hero?: React.ReactNode; children: React.ReactNode }) {
  const { book, index, page, prev, next } = locate(version, slug);
  // the hero carries the page's h1 on a version's first page
  const Title = hero ? "h2" : "h1";

  return (
    <article>
      {hero}
      <header className={`mb-7 flex items-center gap-4 ${hero ? "pt-16" : "pt-10 sm:pt-14"}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] font-round text-[15px] font-bold" style={CHIP}>
          {pageNumber(index)}
        </span>
        <div className="min-w-0">
          <p className="font-round text-[10.5px] font-bold uppercase tracking-[0.36em]" style={{ color: ACCENT }}>
            {book.label} · {page.kicker}
          </p>
          <Title className="font-round text-[30px] font-semibold leading-tight tracking-[-0.015em] text-white sm:text-[40px]">{page.label}</Title>
        </div>
      </header>

      <div className="space-y-5">{children}</div>

      <nav aria-label="More pages" className="mt-16 grid gap-3 border-t border-white/10 pt-8 sm:grid-cols-2">
        {prev && <Neighbour book={book} page={prev} index={index - 1} dir="prev" />}
        {next && <Neighbour book={book} page={next} index={index + 1} dir="next" />}
      </nav>
    </article>
  );
}
