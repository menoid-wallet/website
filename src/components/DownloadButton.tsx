"use client";

import CloudChip from "./CloudChip";
import { openDownload } from "./DownloadModal";

/* ────────────────────────────────────────────────────────────
   The page's call to action now that V1 ships — a white cloud
   with violet ink, so it reads as the brightest thing in the sky
   it sits on. The sheet it opens lives in DownloadModal, mounted
   once at the bottom of the page; this is only the trigger.

   `fluid` fills the column it is given (the hero, where it has a
   whole block to itself); left off, it hugs its label (the
   closing section, where it sits under centred copy).
   ──────────────────────────────────────────────────────────── */

const DownloadGlyph = ({ size = 14 }: { size?: number }) => (
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
    <path d="M12 3v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);

export default function DownloadButton({ fluid = false }: { fluid?: boolean }) {
  return (
    <div className={fluid ? "block w-full" : "inline-flex max-w-full"}>
      <button
        type="button"
        onClick={openDownload}
        className={`btn-spring group relative outline-none ${fluid ? "block w-full" : "inline-block"}`}
      >
        <CloudChip tone="light" className={fluid ? "w-full justify-center px-7 py-3.5" : "px-7 py-3"}>
          <span
            className="flex items-center gap-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.22em] sm:text-[13px]"
            style={{ color: "var(--violet-deep)" }}
          >
            <span className="text-[13px] leading-none">✦</span>
            Download
            <DownloadGlyph size={15} />
          </span>
        </CloudChip>
      </button>
    </div>
  );
}
