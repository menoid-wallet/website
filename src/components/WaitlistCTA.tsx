import Image from "next/image";
import Reveal from "./Reveal";
// import WaitlistForm from "./WaitlistForm"; // re-enable when V1 beta registration opens

const PERKS = ["🎁 Airdrop rewards", "📡 Early feature access", "🏆 Founding crew badge"];

export default function WaitlistCTA() {
  return (
    <section id="waitlist" className="grain relative overflow-hidden py-32 px-4 sm:px-6">
      {/* Opaque section background placed behind the particles canvas */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)" }}
      />
      {/* Orbs */}
      <div className="orb orb-1 absolute" style={{ top: "-18%", right: "-14%", width: "min(80vw,440px)", height: "min(80vw,440px)" }} />
      <div className="orb orb-2 absolute" style={{ bottom: "-20%", left: "-18%", width: "min(86vw,480px)", height: "min(86vw,480px)" }} />

      {/* Gold line top */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(163,110,20,0.4) 30%, rgba(232,174,58,0.6) 50%, rgba(163,110,20,0.4) 70%, transparent)" }}
      />

      {/* Corner ornaments */}
      {["top-8 left-8", "top-8 right-8", "bottom-8 left-8", "bottom-8 right-8"].map((pos) => (
        <div key={pos} className={`pointer-events-none absolute ${pos} font-mono text-sm`} style={{ color: "rgba(163,110,20,0.3)" }} aria-hidden>
          ✦
        </div>
      ))}

      {/* Inner decorative frame */}
      <div
        className="pointer-events-none absolute inset-8 rounded-3xl border hidden md:block"
        style={{ borderColor: "rgba(200,146,14,0.14)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          {/* Left Column: Floating Ship */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            <Reveal className="w-full">
              <div className="relative mx-auto md:ml-0 md:-translate-x-4 w-[clamp(240px,70vw,400px)]">
                <div className="waitlist-ship relative w-full aspect-square">
                  <Image
                    src="/ship/ship.webp"
                    alt="Menoid Ship"
                    fill
                    sizes="(max-width: 768px) 70vw, 400px"
                    className="object-contain filter drop-shadow-[0_18px_30px_rgba(163,110,20,0.3)]"
                  />
                </div>
                <div className="waitlist-ripple" aria-hidden />
              </div>
            </Reveal>
          </div>

          {/* Right Column: Waitlist Signup */}
          <div className="md:col-span-7 text-left">
            <Reveal>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(163,110,20,0.22)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-xs)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] pulse-dot" />
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
                  V1 Early access
                </span>
              </div>

              <h2
                className="font-display font-black tracking-[-0.035em] text-[var(--ink)] mb-4"
                style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: "1.1" }}
              >
                Sail before the
                <br />
                <em className="font-display font-light italic text-[var(--gold-deep)]">crowd sets anchor.</em>
              </h2>

              <p className="text-[14.5px] sm:text-[15px] leading-relaxed text-[var(--ink-soft)] mb-8">
                The Menoid early access filling fast. Secure your spot and get priority access before
                public launch — plus exclusive early crew perks.
              </p>
            </Reveal>

            {/* Email + ship slider */}
            <Reveal delay={120}>
              {/* Registration temporarily disabled — re-enable when V1 beta opens:
              <WaitlistForm inputId="cta-email-input" />
              */}
              <div
                className="max-w-md rounded-2xl px-5 py-4"
                style={{
                  background: "#FAF5E8",
                  border: "1px solid rgba(163,110,20,0.28)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)",
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
                  ⚓ Coming Soon
                </p>
                <p className="mt-1.5 font-display text-[17px] font-bold text-[var(--ink)]">
                  V1 Private Beta registration coming soon…
                </p>
              </div>
            </Reveal>

            {/* Perks */}
            <Reveal delay={180} className="mt-8">
              <div className="flex flex-wrap gap-2">
                {PERKS.map((perk) => (
                  <span
                    key={perk}
                    className="rounded-full px-3.5 py-1.5 text-[12px] text-[var(--ink-soft)]"
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(163,110,20,0.16)",
                      boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <style>{`
        /* Gentle, buoyant float — like the ship is riding swells */
        @keyframes waitlistShipBob {
          0%   { transform: translateY(0px)  rotate(-2deg); }
          25%  { transform: translateY(-7px) rotate(1.2deg); }
          50%  { transform: translateY(-2px) rotate(2.6deg); }
          75%  { transform: translateY(-9px) rotate(0.4deg); }
          100% { transform: translateY(0px)  rotate(-2deg); }
        }
        .waitlist-ship { animation: waitlistShipBob 6.5s ease-in-out infinite; will-change: transform; }

        /* Water ripple/shadow under the hull */
        @keyframes waitlistRipple {
          0%, 100% { transform: translateX(-50%) scaleX(1);    opacity: 0.45; }
          50%      { transform: translateX(-50%) scaleX(1.14); opacity: 0.8; }
        }
        .waitlist-ripple {
          position: absolute; left: 50%; bottom: 7%;
          width: 56%; height: 24px; transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(163,110,20,0.30) 0%, transparent 70%);
          filter: blur(7px); border-radius: 50%; pointer-events: none;
          animation: waitlistRipple 6.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .waitlist-ship, .waitlist-ripple { animation: none; }
        }
      `}</style>
    </section>
  );
}
