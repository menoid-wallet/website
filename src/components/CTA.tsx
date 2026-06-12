import Image from "next/image";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <section id="download" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal variant="scale">
          <div
            className="relative overflow-hidden rounded-[36px] px-8 py-14 text-center md:px-16 md:py-20"
            style={{
              background:
                "linear-gradient(180deg, #0e0a07 0%, #1a1410 55%, #0d0905 100%)",
              boxShadow: "var(--shadow-xl), var(--shadow-gold)",
            }}
          >
            {/* glows */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-32 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(240,217,139,0.32) 0%, transparent 60%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-32 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(212,160,23,0.25) 0%, transparent 60%)",
              }}
            />

            {/* subtle compass-rose outline */}
            <svg
              aria-hidden
              viewBox="0 0 400 400"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
            >
              <g className="compass-slow" style={{ transformOrigin: "200px 200px" }}>
                {Array.from({ length: 48 }).map((_, i) => {
                  const a = (i / 48) * Math.PI * 2;
                  const r1 = i % 4 === 0 ? 130 : 140;
                  const r2 = 168;
                  return (
                    <line
                      key={i}
                      x1={200 + Math.cos(a) * r1}
                      y1={200 + Math.sin(a) * r1}
                      x2={200 + Math.cos(a) * r2}
                      y2={200 + Math.sin(a) * r2}
                      stroke="#f0d98b"
                      strokeWidth={i % 4 === 0 ? 2 : 1}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            </svg>

            {/* mini meno */}
            <div className="relative mx-auto h-28 w-28 gentle-bob">
              <Image
                src="/meno/meno_hi_text.png"
                alt=""
                fill
                sizes="112px"
                className="object-contain drop-shadow-[0_18px_30px_rgba(124,90,10,0.45)]"
              />
            </div>

            <h2 className="relative mt-6 font-display text-[clamp(36px,5vw,64px)] font-black leading-[1] tracking-[-0.02em] text-[var(--bg)]">
              Join the ZK-Stealth Testnet.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--bg)]/75">
              Secure your spot on the beta tester list for AI-native private transfers on Monad, or schedule a direct chat with the core developer crew.
            </p>

            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#top"
                className="btn-spring group inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3.5 text-[15px] font-semibold text-[var(--ink)]"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 32px -8px rgba(124,90,10,0.50), 0 2px 6px rgba(124,90,10,0.40)",
                }}
              >
                Join Waitlist Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="https://cal.com/menoid/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-spring inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-[var(--bg)] backdrop-blur"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Book Developer Call
              </a>
            </div>

            <p className="relative mt-6 font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--bg)]/45">
              Open source · Private Testnet Beta · ZK-snarks
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
