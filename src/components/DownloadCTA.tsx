"use client";

import Reveal from "./Reveal";
import LaunchAppButton from "./LaunchAppButton";
import { openDownload } from "./DownloadModal";

/* ────────────────────────────────────────────────────────────
   THE CLOSE — the last beat of the roadmap, not a page of its own.
   It renders inside the roadmap's section, so it inherits that sky
   and the rain falling through it: no background, no frame. V1 is
   the app in the browser, so the page closes on launching it; the
   V0.5 builds stay one small link away.
   ──────────────────────────────────────────────────────────── */

export default function DownloadCTA() {
  return (
    <div id="download" className="relative z-10 px-4 pb-28 sm:px-6">
      <Reveal className="mx-auto max-w-xl text-center">
        <div
          className="mx-auto mb-10 h-px w-full max-w-[220px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)" }}
          aria-hidden
        />

        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/60">✦ V1 Mainnet is live ✦</p>

        <h3
          className="font-round mt-3 font-semibold tracking-[-0.02em] text-white"
          style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
        >
          Your privacy, one click away.
        </h3>

        <div className="mt-6">
          <LaunchAppButton label="Launch App V1 (Mainnet)" />
        </div>

        <p className="mt-5 text-[12.5px] text-white/60">
          Prefer the extension or the Android app?{" "}
          <button
            type="button"
            onClick={openDownload}
            className="font-semibold text-[#FFCF8A] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#FFE2B8]"
          >
            Download V0.5
          </button>
        </p>
      </Reveal>
    </div>
  );
}
