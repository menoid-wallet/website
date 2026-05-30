import Image from "next/image";
import Reveal from "./Reveal";

const COLS = [
  { title: "Product", links: ["Wallet", "Stash mode", "Bridge", "Roadmap"] },
  { title: "Developers", links: ["Docs", "SDK", "Audits", "GitHub"] },
  { title: "Crew", links: ["About", "Manifesto", "Careers", "Press"] },
  { title: "Help", links: ["Support", "Security", "Status", "Bounty"] },
];

export default function Footer() {
  return (
    <footer
      id="learn"
      className="relative mt-12 border-t border-[var(--line)] py-16"
      style={{
        background:
          "linear-gradient(180deg, var(--bg-soft) 0%, var(--bg-deep) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="relative h-10 w-10 overflow-hidden rounded-full bg-[var(--paper)] ring-1 ring-[var(--line)]"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <Image src="/meno-hat.png" alt="" fill sizes="40px" className="object-contain p-0.5" />
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Menoid
                </span>
              </div>
              <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--ink-soft)]">
                The friendly pirate wallet. Stashing crypto privately since
                the year of the kraken.
              </p>
              <div className="mt-6 flex gap-2">
                {["GH", "X", "DC", "TG"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--paper)] font-mono text-[10px] font-bold text-[var(--ink-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--gold-deep)]"
                    style={{ boxShadow: "var(--shadow-xs)" }}
                    aria-label={s}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {COLS.map((c) => (
              <div key={c.title}>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">
                  {c.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-[14px] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-8 md:flex-row">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
            © {new Date().getFullYear()} Menoid · Plundering privacy back, one block at a time
          </p>
          <div className="flex gap-6 text-[12px] text-[var(--ink-soft)]">
            <a href="#" className="hover:text-[var(--ink)]">Privacy</a>
            <a href="#" className="hover:text-[var(--ink)]">Terms</a>
            <a href="#" className="hover:text-[var(--ink)]">Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
