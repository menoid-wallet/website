import Reveal from "./Reveal";
import DownloadButton from "./DownloadButton";

/* ────────────────────────────────────────────────────────────
   DOWNLOAD — the last beat of the roadmap, not a page of its own.
   It renders inside the roadmap's section, so it inherits that sky
   and the rain falling through it: no background, no frame, just
   the same button the hero opens with, closing the page on the
   note it started on.
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

        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/60">✦ Download ✦</p>

        <h3
          className="font-round mt-3 font-semibold tracking-[-0.02em] text-white"
          style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
        >
          Your privacy, one download away.
        </h3>

        {/* V1 is out — the two builds live behind this button. */}
        <div className="mt-6">
          <DownloadButton />
        </div>
      </Reveal>
    </div>
  );
}
