import Link from "next/link";

import CloudChip from "./CloudChip";

/* ────────────────────────────────────────────────────────────
   The hero's way into the private web app (/app) — the same white
   cloud as the download button below it, so the two read as a
   pair: use V1 in the browser, or download the V0.5 testnet apps.
   ──────────────────────────────────────────────────────────── */

const LaunchGlyph = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    focusable="false"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export default function LaunchAppButton({ fluid = false, label = "Launch App" }: { fluid?: boolean; label?: string }) {
  return (
    <div className={fluid ? "block w-full" : "inline-flex max-w-full"}>
      <Link href="/app" className={`btn-spring group relative outline-none ${fluid ? "block w-full" : "inline-block"}`}>
        <CloudChip tone="light" className={fluid ? "w-full justify-center px-7 py-3.5" : "px-7 py-3"}>
          <span
            className="flex items-center gap-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.22em] sm:text-[13px]"
            style={{ color: "var(--violet-deep)" }}
          >
            <span className="text-[13px] leading-none">✦</span>
            {label}
            <LaunchGlyph size={15} />
          </span>
        </CloudChip>
      </Link>
    </div>
  );
}
