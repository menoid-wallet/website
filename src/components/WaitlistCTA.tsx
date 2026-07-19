import Reveal from "./Reveal";
// import WaitlistForm from "./WaitlistForm"; // re-enable when V1 registration opens

/* ────────────────────────────────────────────────────────────
   WAITLIST — the last beat of the roadmap, not a page of its own.
   It renders inside the roadmap's section, so it inherits that sky
   and the rain falling through it: no background, no frame, just
   the same "coming soon" badge the hero opens with, closing the
   page on the note it started on.
   ──────────────────────────────────────────────────────────── */

export default function WaitlistCTA() {
  return (
    <div id="waitlist" className="relative z-10 px-4 pb-28 sm:px-6">
      <Reveal className="mx-auto max-w-xl text-center">
        <div
          className="mx-auto mb-10 h-px w-full max-w-[220px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)" }}
          aria-hidden
        />

        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/60">✦ Waitlist ✦</p>

        <h3
          className="font-round mt-3 font-semibold tracking-[-0.02em] text-white"
          style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}
        >
          Be first through the door.
        </h3>

        {/* the hero's badge, unchanged — one line wide, two lines on a phone */}
        {/* Registration temporarily disabled — re-enable when V1 registration opens:
        <WaitlistForm inputId="cta-email-input" />
        */}
        <div
          className="mt-6 inline-flex max-w-full flex-col items-center gap-1.5 rounded-2xl px-5 py-3 sm:flex-row sm:gap-2.5 sm:rounded-full sm:py-2.5"
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.26)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.3) inset, 0 14px 32px rgba(38,18,80,0.28)",
            backdropFilter: "blur(14px)",
          }}
        >
          <span className="flex items-center gap-2.5">
            <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/75">V1 Early Beta</span>
          </span>
          <span className="hidden h-3 w-px bg-white/25 sm:block" />
          <span className="font-round text-[14px] font-medium text-white sm:text-[15px]">
            registration coming soon…
          </span>
        </div>
      </Reveal>
    </div>
  );
}
