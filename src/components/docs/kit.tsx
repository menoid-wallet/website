import { Fragment } from "react";

/* ────────────────────────────────────────────────────────────
   The docs' building blocks, in the wallet extension's Noid
   mode: near-white ink on the storm sky, glass rows, lilac
   accent — and the one lit surface (the "treasure card" look)
   kept for what the eye should land on: flowchart nodes and
   the hero card.
   ──────────────────────────────────────────────────────────── */

export const INK = "#F4EEFF";
export const ACCENT = "#C9B0FF";
export const LIT_INK = "#3B2570";

export const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
};

export const WELL: React.CSSProperties = {
  background: "rgba(12,6,30,0.5)",
  border: "1px solid rgba(201,176,255,0.17)",
};

// a light chip with dark ink — the noid token icon / Register button look
export const CHIP: React.CSSProperties = {
  background: "linear-gradient(145deg, #FBF7FF 0%, #D6C4F5 100%)",
  border: "1px solid rgba(78,47,142,0.14)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 24px -14px rgba(12,6,30,0.7)",
  color: LIT_INK,
};

export const LIT: React.CSSProperties = {
  background: "linear-gradient(145deg, #FBF7FF 0%, #EADFFC 55%, #D6C4F5 100%)",
  boxShadow: "0 34px 64px -20px rgba(12,6,30,0.6), 0 8px 24px -8px rgba(201,176,255,0.3), inset 0 1px 0 rgba(255,255,255,0.85)",
  color: LIT_INK,
};

export const BUTTON: React.CSSProperties = {
  background: "linear-gradient(145deg, #F4EEFF, #C9B0FF)",
  color: LIT_INK,
  boxShadow: "0 4px 14px -4px rgba(201,176,255,0.6)",
};

/* ─── icons ─────────────────────────────────────────────────────────────── */

const PATHS: Record<string, React.ReactNode> = {
  browser: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
      <path d="M6.5 6.5h.01M9 6.5h.01" />
    </>
  ),
  wallet: (
    <>
      <path d="M5 7.5V7a2 2 0 0 1 2-2h10.5" />
      <rect x="4" y="7.5" width="16" height="12" rx="2.5" />
      <path d="M16 13.5h.01" />
    </>
  ),
  relayer: (
    <>
      <path d="M21 3 3 10.5l7.2 2.3L12.5 20 21 3z" />
      <path d="m10.2 12.8 4.6-4.6" />
    </>
  ),
  pool: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8.2 7.5 9.5 4.4-1.3 7.5-5.1 7.5-9.5V6L12 3z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  dex: (
    <>
      <path d="M6 8h12l-3.5-3.5" />
      <path d="M18 16H6l3.5 3.5" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.6 3.9-5.5 7-5.5s5.8 1.9 7 5.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="3.5" />
      <path d="M11.5 12H21M18 12v3M15 12v2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  tree: (
    <>
      <path d="M12 7v4M12 11l-6 4.5M12 11l6 4.5" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="17" r="2" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
      <path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  puzzle: (
    <>
      <path d="M10 4a2 2 0 1 1 4 0v1h4v4h1a2 2 0 1 1 0 4h-1v5h-5v-1a2 2 0 1 0-4 0v1H5v-5h1a2 2 0 1 0 0-4H5V5h5V4z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z" />
    </>
  ),
  spark: <path d="M12 3c0 5 4 9 9 9-5 0-9 4-9 9 0-5-4-9-9-9 5 0 9-4 9-9z" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className, style }: { name: IconName; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}

/* ─── the lit card at the top of a doc ──────────────────────────────────── */

export function DocHero({
  eyebrow,
  title,
  lede,
  chips,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: React.ReactNode;
  chips: { label: string; live?: boolean }[];
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-[32px] sm:mt-10" style={LIT}>
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(159,125,249,0.42) 0%, transparent 62%)", filter: "blur(36px)" }} />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(123,85,201,0.3) 0%, transparent 62%)", filter: "blur(44px)" }} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "linear-gradient(to right,#4E2F8E 1px,transparent 1px),linear-gradient(to bottom,#4E2F8E 1px,transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div className="docs-sheen pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)" }} />

      <div className="relative px-6 py-9 sm:px-10 sm:py-12">
        <p className="font-round text-[10px] font-bold uppercase tracking-[0.45em] text-[#4E2F8E]/60">{eyebrow}</p>
        <h1
          className="mt-3 font-round text-[40px] font-bold leading-[1.02] tracking-[-0.03em] sm:text-[58px]"
          style={{ color: LIT_INK, textShadow: "0 0 44px rgba(123,85,201,0.28), 0 2px 8px rgba(78,47,142,0.14)" }}
        >
          {title}
        </h1>
        <p className="mt-4 max-w-[620px] text-[16.5px] leading-[1.65] text-[#3B2570]/80 sm:text-[18px]">{lede}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c.label}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold"
              style={{ background: "rgba(78,47,142,0.09)", color: "#4E2F8E", border: "1px solid rgba(78,47,142,0.12)" }}
            >
              {c.live && <span className="h-1.5 w-1.5 rounded-full bg-[#1F9D6A] shadow-[0_0_0_3px_rgba(31,157,106,0.18)]" />}
              {c.label}
            </span>
          ))}
        </div>
        {children && <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </div>
  );
}

/* ─── text ──────────────────────────────────────────────────────────────── */

export function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3 id={id} className="scroll-mt-24 pt-5 font-round text-[20px] font-semibold tracking-[-0.005em] text-white sm:text-[22px]">
      {children}
    </h3>
  );
}

export function P({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[16px] leading-[1.78] text-white/78 [&_strong]:font-semibold [&_strong]:text-white ${className}`}>{children}</p>;
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-[17.5px] leading-[1.75] text-white/85 [&_strong]:font-semibold [&_strong]:text-white">{children}</p>;
}

export function C({ children }: { children: React.ReactNode }) {
  return (
    <code className="whitespace-nowrap rounded-md px-1.5 py-[1px] font-mono text-[0.86em]" style={{ background: "rgba(201,176,255,0.13)", color: "#E6DAFF" }}>
      {children}
    </code>
  );
}

// a section label with the fading rule after it (noid's "TOKENS" header)
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <p className="shrink-0 font-round text-[10px] font-bold uppercase tracking-[0.4em] text-white/55">{children}</p>
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.28), transparent)" }} />
    </div>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15.5px] leading-[1.7] text-white/78 [&_strong]:font-semibold [&_strong]:text-white">
          <Icon name="spark" size={11} className="mt-[8px] shrink-0" style={{ color: ACCENT, fill: ACCENT }} />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── formulas ──────────────────────────────────────────────────────────── */

// `//` after a space starts a comment (so a URL's `https://` doesn't)
function splitComment(line: string): [string, string | null] {
  const match = /(^|\s)\/\//.exec(line);
  if (!match) return [line, null];
  const at = match.index + match[1].length;
  return [line.slice(0, at).trimEnd(), line.slice(at)];
}

// comments are drawn in the accent, faded, and lined up in one column
function CodeLine({ line, column }: { line: string; column: number }) {
  const [code, comment] = splitComment(line);
  if (comment === null) return <>{code || " "}</>;
  return (
    <>
      {code ? code.padEnd(column) : ""}
      <span style={{ color: "rgba(201,176,255,0.62)" }}>{comment}</span>
    </>
  );
}

export function Formula({ code, label = "Formula", caption }: { code: string; label?: string; caption?: React.ReactNode }) {
  const lines = code.replace(/^\n+|\n+$/g, "").split("\n");
  const commented = lines.map(splitComment).filter(([c, comment]) => comment !== null && c);
  const column = commented.length ? Math.max(...commented.map(([c]) => c.length)) + 3 : 0;
  return (
    <figure className="overflow-hidden rounded-[18px]" style={WELL}>
      <figcaption className="flex items-center gap-2 border-b px-4 py-2" style={{ borderColor: "rgba(201,176,255,0.12)" }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
        <span className="font-round text-[10px] font-bold uppercase tracking-[0.32em] text-white/55">{label}</span>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-[1.85] text-[#EDE4FF] sm:text-[13.5px]">
        {lines.map((line, i) => (
          <Fragment key={i}>
            <CodeLine line={line} column={column} />
            {i < lines.length - 1 ? "\n" : null}
          </Fragment>
        ))}
      </pre>
      {caption && <p className="border-t px-4 py-2.5 text-[13px] leading-[1.6] text-white/60" style={{ borderColor: "rgba(201,176,255,0.12)" }}>{caption}</p>}
    </figure>
  );
}

/** One formula, explained: what it is, why it is built this way, where it is used, and a small example. */
export function FormulaCard({
  symbol,
  name,
  code,
  what,
  why,
  used,
  example,
}: {
  symbol: string;
  name: string;
  code: string;
  what: React.ReactNode;
  why: React.ReactNode;
  used: React.ReactNode;
  example?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] p-4 sm:p-5" style={GLASS}>
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <span className="rounded-[10px] px-2.5 py-1 font-mono text-[13px] font-semibold" style={CHIP}>
          {symbol}
        </span>
        <span className="font-round text-[16.5px] font-semibold text-white">{name}</span>
      </div>
      <Formula code={code} />
      <dl className="mt-4 grid gap-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-x-4">
        {(
          [
            ["What it is", what],
            ["Why", why],
            ["Used in", used],
          ] as const
        ).map(([k, v]) => (
          <Fragment key={k}>
            <dt className="font-round text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/45 sm:pt-[5px]">{k}</dt>
            <dd className="text-[15px] leading-[1.7] text-white/80 [&_strong]:font-semibold [&_strong]:text-white">{v}</dd>
          </Fragment>
        ))}
      </dl>
      {example && <Example>{example}</Example>}
    </div>
  );
}

export function Example({ title = "Example", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[16px] border-l-[3px] px-4 py-3" style={{ background: "rgba(110,231,168,0.06)", borderColor: "#6EE7A8" }}>
      <p className="mb-1 font-round text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "#8DF0BC" }}>
        {title}
      </p>
      <div className="text-[14.5px] leading-[1.72] text-white/82 [&_strong]:font-semibold [&_strong]:text-white">{children}</div>
    </div>
  );
}

/* ─── tables ────────────────────────────────────────────────────────────── */

export function Table({ head, rows, mono = [] }: { head: string[]; rows: React.ReactNode[][]; mono?: number[] }) {
  return (
    <div className="overflow-x-auto rounded-[20px]" style={GLASS}>
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 pb-2.5 pt-3.5 font-round text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/[0.08] align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 text-[14.5px] leading-[1.6] [&_strong]:font-semibold [&_strong]:text-white ${
                    mono.includes(j) ? "font-mono text-[13px] text-[#E6DAFF]" : j === 0 ? "font-semibold text-white" : "text-white/78"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Field / what it is / why — stacked on a phone. */
export function Fields({ rows }: { rows: [string, React.ReactNode, React.ReactNode][] }) {
  return (
    <div className="overflow-hidden rounded-[20px]" style={GLASS}>
      <div className="hidden grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] gap-4 px-4 pb-2.5 pt-3.5 md:grid">
        {["Field", "What it is", "Why it is there"].map((h) => (
          <p key={h} className="font-round text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/50">
            {h}
          </p>
        ))}
      </div>
      {rows.map(([field, what, why], i) => (
        <div key={i} className="grid gap-1.5 border-t border-white/[0.08] px-4 py-3.5 first:border-t-0 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] md:gap-4 md:first:border-t">
          <p className="font-mono text-[13px] font-semibold" style={{ color: ACCENT }}>
            {field}
          </p>
          <p className="text-[14.5px] leading-[1.65] text-white/85 [&_strong]:text-white">{what}</p>
          <p className="text-[14.5px] leading-[1.65] text-white/65 [&_strong]:text-white/90">
            <span className="mr-1.5 font-round text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 md:hidden">Why</span>
            {why}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── callouts ──────────────────────────────────────────────────────────── */

const TONES = {
  note: { line: "rgba(201,176,255,0.45)", bg: "rgba(201,176,255,0.08)", fg: ACCENT, icon: "spark" as IconName },
  warn: { line: "rgba(255,197,138,0.55)", bg: "rgba(255,197,138,0.08)", fg: "#FFC58A", icon: "key" as IconName },
  tip: { line: "rgba(110,231,168,0.5)", bg: "rgba(110,231,168,0.07)", fg: "#8DF0BC", icon: "check" as IconName },
};

export function Callout({ tone = "note", title, children }: { tone?: keyof typeof TONES; title: string; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <div className="flex gap-3.5 rounded-[18px] border px-4 py-3.5" style={{ background: t.bg, borderColor: t.line }}>
      <Icon name={t.icon} size={18} className="mt-0.5 shrink-0" style={{ color: t.fg }} />
      <div className="min-w-0">
        <p className="font-round text-[15px] font-semibold" style={{ color: t.fg }}>
          {title}
        </p>
        <div className="mt-1 text-[14.5px] leading-[1.7] text-white/80 [&_strong]:font-semibold [&_strong]:text-white">{children}</div>
      </div>
    </div>
  );
}

/** "Go deeper" — collapsed by default so the main line stays simple. */
export function Deeper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="docs-details group rounded-[18px]" style={GLASS}>
      <summary className="flex items-center gap-3 px-4 py-3.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="docs-chevron shrink-0 transition-transform duration-300" aria-hidden>
          <path d="M3 1.5 6.5 5 3 8.5" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-round text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">Go deeper</span>
        <span className="font-round text-[15px] font-semibold text-white/90">{title}</span>
      </summary>
      <div className="space-y-4 border-t border-white/[0.08] px-4 pb-4 pt-4">{children}</div>
    </details>
  );
}

/* ─── facts and visibility ──────────────────────────────────────────────── */

export function Facts({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-[18px] px-3.5 py-3" style={GLASS}>
          <p className="font-round text-[9.5px] font-bold uppercase tracking-[0.24em] text-white/45">{k}</p>
          <p className="mt-1 text-[14px] font-medium leading-[1.45] text-white/90">{v}</p>
        </div>
      ))}
    </div>
  );
}

export function Visibility({ seen, hidden }: { seen: React.ReactNode[]; hidden: React.ReactNode[] }) {
  const col = (title: string, icon: IconName, color: string, items: React.ReactNode[]) => (
    <div className="rounded-[20px] p-4" style={GLASS}>
      <p className="mb-3 flex items-center gap-2 font-round text-[14px] font-semibold" style={{ color }}>
        <Icon name={icon} size={17} />
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[14.5px] leading-[1.6] text-white/80">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {col("On-chain, anyone can see", "eye", "#FFC58A", seen)}
      {col("Stays private", "lock", "#8DF0BC", hidden)}
    </div>
  );
}

/* ─── steps: point-wise, grouped by where each step happens ─────────────── */

export type StepGroup = { where: string; icon: IconName; note?: string; items: React.ReactNode[] };

export function Steps({ groups }: { groups: StepGroup[] }) {
  // numbering runs on across the groups
  const starts = groups.map((_, i) => groups.slice(0, i).reduce((sum, g) => sum + g.items.length, 0));
  return (
    <div className="space-y-3">
      {groups.map((g, gi) => (
        <div key={g.where} className="rounded-[22px] p-4 sm:p-5" style={GLASS}>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]" style={CHIP}>
              <Icon name={g.icon} size={18} />
            </span>
            <div className="min-w-0">
              <p className="font-round text-[16px] font-semibold text-white">{g.where}</p>
              {g.note && <p className="text-[12.5px] text-white/50">{g.note}</p>}
            </div>
          </div>
          <ol className="space-y-2.5">
            {g.items.map((item, ii) => {
              const n = starts[gi] + ii + 1;
              return (
                <li key={n} className="flex gap-3 text-[15px] leading-[1.68] text-white/80 [&_strong]:font-semibold [&_strong]:text-white">
                  <span
                    className="mt-[2px] flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 font-round text-[11px] font-bold"
                    style={{ background: "rgba(201,176,255,0.16)", color: "#E6DAFF", border: "1px solid rgba(201,176,255,0.3)" }}
                  >
                    {n}
                  </span>
                  <span className="min-w-0">{item}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

/* ─── flowcharts ────────────────────────────────────────────────────────── */

export type FlowNode = { icon: IconName; title: string; lines?: string[] };
export type FlowEdge = string | { label: string; back: string };

function ArrowRight({ back = false }: { back?: boolean }) {
  return (
    <svg width="54" height="12" viewBox="0 0 54 12" fill="none" aria-hidden className={back ? "rotate-180" : undefined}>
      <path d="M2 6h44" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="4 4" className="docs-flow" />
      <path d="M45 1.5 51 6l-6 4.5" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDown({ back = false }: { back?: boolean }) {
  return (
    <svg width="12" height="34" viewBox="0 0 12 34" fill="none" aria-hidden className={back ? "rotate-180" : undefined}>
      <path d="M6 2v24" stroke={ACCENT} strokeWidth="1.6" strokeDasharray="4 4" className="docs-flow" />
      <path d="M1.5 25 6 31l4.5-6" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Edge({ edge }: { edge: FlowEdge }) {
  const two = typeof edge !== "string";
  const label = typeof edge === "string" ? edge : edge.label;
  return (
    <>
      {/* wide: a horizontal arrow with its label above */}
      <div className="hidden w-[76px] shrink-0 flex-col items-center justify-center gap-1 px-1 md:flex">
        <span className="text-center text-[10.5px] font-medium leading-[1.25] [overflow-wrap:anywhere]" style={{ color: ACCENT }}>
          {label}
        </span>
        <ArrowRight />
        {two && (
          <>
            <ArrowRight back />
            <span className="text-center text-[10.5px] font-medium leading-[1.25] [overflow-wrap:anywhere]" style={{ color: ACCENT }}>
              {edge.back}
            </span>
          </>
        )}
      </div>
      {/* phone: a vertical arrow with its label beside it */}
      <div className="flex items-center justify-center gap-2.5 py-1.5 md:hidden">
        <ArrowDown />
        {two && <ArrowDown back />}
        <span className="max-w-[60%] text-[12px] font-medium leading-[1.3]" style={{ color: ACCENT }}>
          {two ? `${label} · ${edge.back}` : label}
        </span>
      </div>
    </>
  );
}

export function Flow({ nodes, edges, caption }: { nodes: FlowNode[]; edges: FlowEdge[]; caption?: React.ReactNode }) {
  return (
    <figure className="relative overflow-hidden rounded-[26px] p-4 sm:p-5" style={WELL}>
      <div className="menoid-grid-noid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative flex flex-col md:flex-row md:items-stretch">
        {nodes.map((node, i) => (
          <Fragment key={i}>
            <div className="flex min-w-0 flex-1 flex-col items-center rounded-[18px] px-3 py-3.5 text-center" style={CHIP}>
              <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(78,47,142,0.1)" }}>
                <Icon name={node.icon} size={18} />
              </span>
              <p className="font-round text-[14.5px] font-semibold leading-tight">{node.title}</p>
              {node.lines?.map((line) => (
                <p key={line} className="mt-1 text-[11.5px] leading-[1.35] text-[#3B2570]/70">
                  {line}
                </p>
              ))}
            </div>
            {i < nodes.length - 1 && <Edge edge={edges[i]} />}
          </Fragment>
        ))}
      </div>
      {caption && <figcaption className="relative mt-3.5 text-center text-[13px] leading-[1.55] text-white/55">{caption}</figcaption>}
    </figure>
  );
}

/* ─── key derivation tree ───────────────────────────────────────────────── */

export type TreeStep = { code: string; edge?: string };
export type TreeColumn = { title: string; icon: IconName; rows: string[]; note?: string };

export function KeyTree({ root, columns, merge }: { root: TreeStep[]; columns: TreeColumn[]; merge: { code: string; note: string; edge: string } }) {
  const cols = columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <figure className="relative overflow-hidden rounded-[26px] p-4 sm:p-6" style={WELL}>
      <div className="menoid-grid-noid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative flex flex-col items-center">
        {root.map((step, i) => (
          <Fragment key={step.code}>
            <div className="w-full max-w-[460px] rounded-[16px] px-4 py-2.5 text-center font-mono text-[12.5px] font-semibold sm:text-[13px]" style={CHIP}>
              {step.code}
            </div>
            {(step.edge || i < root.length - 1) && (
              <div className="flex items-center gap-2.5 py-1">
                <ArrowDown />
                {step.edge && <span className="font-mono text-[11px] leading-tight" style={{ color: ACCENT }}>{step.edge}</span>}
              </div>
            )}
          </Fragment>
        ))}

        <div className={`grid w-full gap-3 ${cols}`}>
          {columns.map((col) => (
            <div key={col.title} className="rounded-[18px] p-3.5" style={GLASS}>
              <p className="mb-2.5 flex items-center gap-2 font-round text-[14px] font-semibold text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-[9px]" style={CHIP}>
                  <Icon name={col.icon} size={15} />
                </span>
                {col.title}
              </p>
              <div className="space-y-1.5">
                {col.rows.map((row, i) => (
                  <Fragment key={row}>
                    {i > 0 && <p className="text-center font-mono text-[11px] leading-none" style={{ color: ACCENT }}>↓</p>}
                    <p className="rounded-[10px] px-2.5 py-1.5 font-mono text-[11.5px] leading-[1.45] text-[#EDE4FF]" style={{ background: "rgba(12,6,30,0.35)" }}>
                      {row}
                    </p>
                  </Fragment>
                ))}
              </div>
              {col.note && <p className="mt-2.5 text-[12.5px] leading-[1.5] text-white/55">{col.note}</p>}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 py-1">
          <ArrowDown />
          <span className="font-mono text-[11px] leading-tight" style={{ color: ACCENT }}>
            {merge.edge}
          </span>
        </div>
        <div className="w-full max-w-[560px] rounded-[16px] px-4 py-3 text-center" style={CHIP}>
          <p className="font-mono text-[12.5px] font-semibold sm:text-[13px]">{merge.code}</p>
          <p className="mt-1 text-[12px] text-[#3B2570]/70">{merge.note}</p>
        </div>
      </div>
    </figure>
  );
}

/* ─── addresses ─────────────────────────────────────────────────────────── */

export function Addr({ value, explorer }: { value: string; explorer?: string }) {
  const text = <span className="break-all font-mono text-[12.5px] text-[#E6DAFF]">{value}</span>;
  if (!explorer) return text;
  return (
    <a href={`${explorer}/address/${value}`} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-[#C9B0FF]">
      {text}
    </a>
  );
}
