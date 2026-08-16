"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

/* ────────────────────────────────────────────────────────────
   DOWNLOAD — the sheet holding the two builds that exist:
   Android on the left, the browser extension on the right, side
   by side on a laptop and stacked on a phone. One line closes it
   — V3 is still weather ahead.

   Mounted ONCE, at the bottom of the page, and opened by an event
   rather than by owning a trigger. Three different things open it
   (the nav chip, the hero button, the closing section), and if
   each carried its own copy of the modal they could stack two
   overlays on top of each other. Portaled to <body> besides: the
   hero and the roadmap both stack their clouds, and a fixed
   overlay rendered inside either of them would sit under the rain.
   ──────────────────────────────────────────────────────────── */

const OPEN_EVENT = "menoid:open-download";

/** Open the download sheet from anywhere on the page. */
export function openDownload() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type Build = {
  key: string;
  art: string;
  alt: string;
  eyebrow: string;
  name: string;
  meta: string;
  points: string[];
  href: string;
  cta: string;
};

const BUILDS: Build[] = [
  {
    key: "android",
    art: "/download/android.png",
    alt: "Android robot",
    eyebrow: "Mobile",
    name: "Android",
    meta: "APK · V1 Testnet",
    points: [
      "Open and Noid modes, in your pocket.",
      "Live on 6 testnets — Monad, Sepolia, Base, Solana, Sui & Aptos.",
      "Self custodial wallet.",
    ],
    href: "https://drive.google.com/drive/folders/146EXALOzfd1enunzIPDTNcnipwjY3hAl",
    cta: "Download APK",
  },
  {
    key: "extension",
    art: "/download/extension.png",
    alt: "Browser extension puzzle piece",
    eyebrow: "Desktop",
    name: "Extension",
    meta: "Chrome · Brave · Edge",
    points: [
      "Open and Noid modes, in your browser.",
      "Same keys, same shielded pool as the phone.",
      "Unpacked build — load it from Developer mode.",
    ],
    href: "https://drive.google.com/drive/folders/1PpW4NgWqg50F3Cx_jasYtCGmRkN91WJt",
    cta: "Download Extension",
  },
];

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

const Tick = () => (
  <svg viewBox="0 0 24 24" className="dl-tick" aria-hidden focusable="false">
    <circle cx="12" cy="12" r="11" />
    <path d="m7 12.4 3.4 3.3L17 8.8" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function DownloadModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Lock the body while the sheet is up, and close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const modal = (
    <div
      className="dl-overlay fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(30,14,70,0.55)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Download Menoid V1"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dl-sheet relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl p-5 sm:p-7"
        style={{
          background: "linear-gradient(165deg, #F7F2FF 0%, #ECE0FC 60%, #DCCDF7 100%)",
          border: "1px solid rgba(78,47,142,0.28)",
          boxShadow: "0 30px 80px rgba(30,14,70,0.4), 0 1px 0 rgba(255,255,255,0.85) inset",
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="btn-spring absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[var(--violet-deep)] outline-none"
          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(78,47,142,0.22)" }}
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-5 pr-10 text-center sm:mb-6 sm:pr-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--violet-deep)]">
            ✦ Menoid V1 · Live
          </p>
          <h3 className="font-display mt-1.5 text-2xl font-black tracking-[-0.02em] text-[var(--violet-deep)] sm:text-3xl">
            Take Menoid with you.
          </h3>
          <p className="mt-1.5 text-[13px] text-[rgba(59,37,112,0.7)] sm:text-[14px]">
            Two builds are out today. Pick your surface.
          </p>
        </div>

        {/* The two builds */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {BUILDS.map((b) => (
            <div key={b.key} className="dl-card">
              <div className="dl-card-top">
                <span className="dl-tile">
                  <Image src={b.art} alt={b.alt} width={112} height={112} className="dl-art" />
                </span>
                <span className="dl-eyebrow">{b.eyebrow}</span>
              </div>

              <p className="dl-name">{b.name}</p>
              <p className="dl-meta">{b.meta}</p>

              <ul className="dl-points">
                {b.points.map((p) => (
                  <li key={p}>
                    <Tick />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <a
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className="dl-btn shine btn-spring"
              >
                <span className="shine-layer" aria-hidden />
                <DownloadGlyph />
                {b.cta}
              </a>
            </div>
          ))}
        </div>

        {/* the one line that closes the sheet */}
        <p className="dl-soon">✦ Stay tuned for V3</p>
      </div>
    </div>
  );

  if (!open || typeof document === "undefined") return null;

  return (
    <>
      {createPortal(modal, document.body)}

      <style>{`
        @keyframes dlSheetIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dl-overlay { animation: fade-in 240ms var(--ease-out-quart) forwards; }
        .dl-sheet   { animation: dlSheetIn 340ms var(--ease-out-quart) forwards; }

        /* ── build card ── */
        .dl-card {
          position: relative; display: flex; flex-direction: column;
          border-radius: 20px; padding: 18px 18px 20px;
          background: linear-gradient(170deg, #FFFFFF 0%, #F7F1FF 100%);
          border: 1px solid rgba(78,47,142,0.14);
          box-shadow: 0 10px 26px rgba(48,24,104,0.12), 0 1px 0 rgba(255,255,255,0.9) inset;
          transition: transform 420ms var(--ease-out-quart), box-shadow 420ms var(--ease-out-quart),
                      border-color 420ms var(--ease-out-quart);
        }
        .dl-card:hover {
          transform: translateY(-3px);
          border-color: rgba(78,47,142,0.28);
          box-shadow: 0 20px 44px rgba(48,24,104,0.2), 0 1px 0 rgba(255,255,255,0.9) inset;
        }

        .dl-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }

        /* the deep-violet plate the artwork sits on — both marks were
           coloured to read against exactly this ramp */
        .dl-tile {
          display: grid; place-items: center; width: 68px; height: 68px; border-radius: 18px;
          background: linear-gradient(160deg, #6E50BC 0%, #4E2F8E 100%);
          box-shadow: 0 8px 20px rgba(48,24,104,0.3), 0 0 0 1px rgba(255,255,255,0.16) inset,
                      0 1px 0 rgba(255,255,255,0.34) inset;
        }
        .dl-art { width: 42px; height: 42px; object-fit: contain; }

        .dl-eyebrow {
          font-family: var(--font-geist-mono), monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--violet-deep);
          padding: 5px 9px; border-radius: 999px;
          background: rgba(141,109,204,0.13); border: 1px solid rgba(78,47,142,0.18);
        }

        .dl-name {
          margin-top: 14px; font-family: var(--font-round), sans-serif; font-size: 21px;
          font-weight: 700; letter-spacing: -0.01em; color: var(--violet-deep); line-height: 1.1;
        }
        .dl-meta {
          margin-top: 4px; font-family: var(--font-geist-mono), monospace; font-size: 10px;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(78,47,142,0.55);
        }

        .dl-points {
          margin: 14px 0 18px; padding-top: 13px; display: flex; flex-direction: column; gap: 9px;
          border-top: 1px solid rgba(78,47,142,0.12);
        }
        .dl-points li {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 12.5px; line-height: 1.5; color: rgba(59,37,112,0.82);
        }
        .dl-tick { flex-shrink: 0; width: 15px; height: 15px; margin-top: 1px; }
        .dl-tick circle { fill: rgba(141,109,204,0.16); }
        .dl-tick path { stroke: var(--violet-deep); }

        /* the action — pushed to the bottom so both buttons line up
           even when one card carries a longer point. The gap above it lives
           on .dl-points, because margin-top:auto collapses to 0 the moment
           the two cards happen to be the same height. */
        .dl-btn {
          position: relative; overflow: hidden; margin-top: auto;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px; border-radius: 14px;
          font-family: var(--font-geist-mono), monospace; font-size: 11px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: #F6EFFF; text-align: center;
          background: linear-gradient(160deg, #7B5AC6 0%, #4E2F8E 100%);
          box-shadow: 0 10px 22px rgba(48,24,104,0.32), 0 1px 0 rgba(255,255,255,0.26) inset;
        }

        .dl-soon {
          margin-top: 20px; padding-top: 16px; text-align: center;
          border-top: 1px solid rgba(78,47,142,0.14);
          font-family: var(--font-geist-mono), monospace; font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase; color: rgba(78,47,142,0.62);
        }

        @media (max-width: 640px) {
          .dl-tile { width: 60px; height: 60px; border-radius: 16px; }
          .dl-art  { width: 37px; height: 37px; }
          .dl-name { font-size: 19px; }
          .dl-soon { letter-spacing: 0.18em; }
        }

        @media (prefers-reduced-motion: reduce) {
          .dl-overlay, .dl-sheet { animation: none; }
          .dl-card { transition: none; }
          .dl-card:hover { transform: none; }
        }
      `}</style>
    </>
  );
}
