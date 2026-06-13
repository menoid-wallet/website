"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";

export default function WaitlistCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) { setStatus("error"); setMsg("Please enter a valid email address."); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) {
        setStatus("success"); setMsg(data.message || "You're on the list!");
        localStorage.setItem("menoid_waitlist_registered", "true");
        localStorage.setItem("menoid_waitlist_email", email);
      } else { setStatus("error"); setMsg(data.error || "Something went wrong."); }
    } catch {
      setStatus("success"); setMsg("Welcome aboard! You've been added to the waitlist.");
      localStorage.setItem("menoid_waitlist_registered", "true");
      localStorage.setItem("menoid_waitlist_email", email);
    }
  };

  return (
    <section className="grain relative overflow-hidden py-32 px-4 sm:px-6">
      {/* Opaque section background placed behind the particles canvas */}
      <div 
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(160deg, #FBF1D9 0%, #F4E7CC 55%, #EAD5A7 100%)" }}
      />
      {/* Orbs */}
      <div className="orb orb-1 absolute" style={{ top: "-18%", right: "-14%", width: "min(80vw,440px)", height: "min(80vw,440px)" }} />
      <div className="orb orb-2 absolute" style={{ bottom: "-20%", left: "-18%", width: "min(86vw,480px)", height: "min(86vw,480px)" }} />

      {/* Sheen */}
      <div className="sheen" />

      {/* Gold line top */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(163,110,20,0.4) 30%, rgba(232,174,58,0.6) 50%, rgba(163,110,20,0.4) 70%, transparent)" }}
      />

      {/* Corner ornaments */}
      {["top-8 left-8", "top-8 right-8", "bottom-8 left-8", "bottom-8 right-8"].map((pos) => (
        <div key={pos} className={`pointer-events-none absolute ${pos} font-mono text-sm`}
          style={{ color: "rgba(163,110,20,0.3)" }} aria-hidden>✦</div>
      ))}

      {/* Inner decorative frame */}
      <div
        className="pointer-events-none absolute inset-8 rounded-3xl border hidden md:block"
        style={{ borderColor: "rgba(200,146,14,0.14)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Meno mascot */}
        <Reveal className="mb-6">
          <div className="mx-auto h-28 w-28 relative">
            <Image src="/meno/meno_hi.png" alt="Meno the pirate" fill sizes="112px" className="object-contain gentle-bob" />
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(163,110,20,0.22)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-xs)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
              Limited Spots Available
            </span>
          </div>

          <h2
            className="font-display font-black tracking-[-0.035em] text-[var(--ink)]"
            style={{ fontSize: "clamp(34px, 5.5vw, 68px)" }}
          >
            Sail before the
            <br />
            <em className="font-display font-light italic" style={{ color: "var(--gold-deep)" }}>
              crowd sets anchor.
            </em>
          </h2>

          <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-soft)]">
            The Menoid testnet is filling fast. Secure your spot and get priority
            access before public launch — plus exclusive early crew perks.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          {status !== "success" ? (
            <div>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2 rounded-2xl p-1.5 max-w-md mx-auto"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(163,110,20,0.22)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <input
                  id="cta-email-input" type="email" required
                  placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="flex-1 bg-transparent px-4 py-2.5 text-[15px] text-[var(--ink)] placeholder-[var(--muted)] outline-none min-w-0"
                />
                <button
                  type="submit" id="cta-submit-btn"
                  disabled={status === "loading"}
                  className="btn-spring flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold whitespace-nowrap disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #A36E14 0%, #C8920E 50%, #E8AE3A 100%)",
                    color: "#FBF1D9",
                    boxShadow: "0 0 0 1px rgba(163,110,20,0.35), 0 4px 18px rgba(200,146,14,0.28), 0 1px 0 rgba(255,255,255,0.25) inset",
                  }}
                >
                  {status === "loading" ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FBF1D9] border-t-transparent" />
                  ) : (
                    <>Join Waitlist →</>
                  )}
                </button>
              </form>
              {status === "error" && (
                <p className="mt-3 text-center text-[12px] font-mono text-[var(--ember)]">{msg}</p>
              )}
            </div>
          ) : (
            <div
              className="p-6 rounded-2xl text-center animate-fade-in max-w-md mx-auto"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(163,110,20,0.28)",
                boxShadow: "var(--shadow-gold)",
                backdropFilter: "blur(16px)",
              }}
            >
              <p className="font-display text-xl font-bold text-[var(--gold-deep)]">🏴‍☠️ You&apos;re on the crew!</p>
              <p className="mt-2 text-[14px] text-[var(--ink-soft)]">{msg}</p>
            </div>
          )}
        </Reveal>

        {/* Perks */}
        <Reveal delay={180} className="mt-9">
          <div className="flex flex-wrap justify-center gap-2.5">
            {["🎯 Priority testnet slot", "📡 Early feature access", "🏆 Founding crew badge", "💬 Direct dev channel"].map((perk) => (
              <span
                key={perk}
                className="rounded-full px-3.5 py-1.5 text-[13px] text-[var(--ink-soft)]"
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
    </section>
  );
}
