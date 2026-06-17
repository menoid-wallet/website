"use client";

import { useEffect, useState } from "react";
import ShipSlider, { type SliderPhase } from "./ShipSlider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm({ inputId = "wl-email" }: { inputId?: string }) {
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [phase, setPhase] = useState<SliderPhase>("idle");
  const [msg, setMsg] = useState("");
  const [focused, setFocused] = useState(false);

  // Pull existing emails so we can flag "already joined" as the user types.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/emails`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d?.emails)) {
          setEmails(d.emails.map((e: string) => e.toLowerCase()));
        }
      })
      .catch(() => {});
    // Seed from localStorage too (works even if the backend is offline).
    const stored = typeof window !== "undefined" ? localStorage.getItem("menoid_waitlist_email") : null;
    if (stored) setEmails((prev) => (prev.includes(stored.toLowerCase()) ? prev : [...prev, stored.toLowerCase()]));
    return () => {
      cancelled = true;
    };
  }, []);

  const normalized = email.toLowerCase().trim();
  const valid = EMAIL_RE.test(normalized);
  const alreadyJoined = valid && emails.includes(normalized);
  const canSubmit = valid && !alreadyJoined && phase !== "submitting" && phase !== "success";

  const join = async () => {
    if (!canSubmit) return;
    setPhase("submitting");
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/joinwaitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await res.json();
      if (res.ok && data.joined) {
        setEmails((p) => [...p, normalized]);
        localStorage.setItem("menoid_waitlist_registered", "true");
        localStorage.setItem("menoid_waitlist_email", normalized);
        setMsg(data.message || "Welcome aboard! You're on the waitlist.");
        setPhase("success");
      } else if (res.ok && !data.joined) {
        setEmails((p) => (p.includes(normalized) ? p : [...p, normalized]));
        setMsg(data.message || "You're already on the crew!");
        setPhase("idle");
      } else {
        setMsg(data.error || "Something went wrong. Please try again.");
        setPhase("error");
      }
    } catch {
      setMsg("Couldn't reach the server — make sure the backend is running on :5000.");
      setPhase("error");
    }
  };

  const disabledLabel = alreadyJoined ? "Already on the crew" : "Enter your email to sail";

  // ── Success state ──
  if (phase === "success") {
    return (
      <div
        className="max-w-md w-full rounded-2xl p-5 animate-fade-in"
        style={{
          background: "#FAF5E8",
          border: "1px solid rgba(163,110,28,0.28)",
          boxShadow: "var(--shadow-gold)",
        }}
      >
        <p className="font-display text-lg font-bold text-[var(--gold-deep)]">🏴‍☠️ You&apos;re on the crew!</p>
        <p className="mt-1.5 text-[14px] text-[var(--ink-soft)]">{msg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <input
        id={inputId}
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (phase === "error") setPhase("idle");
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-2xl px-4 py-3 text-[15px] text-[var(--ink)] placeholder-[var(--muted)] outline-none transition-all duration-300"
        style={{
          background: "#FAF5E8",
          border: focused ? "1px solid rgba(200,146,14,0.6)" : "1px solid rgba(163,110,20,0.22)",
          boxShadow: focused
            ? "0 0 0 3px rgba(232,174,58,0.2), 0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)"
            : "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-md)",
        }}
      />

      <div className="mt-2.5">
        <ShipSlider canSubmit={canSubmit} phase={phase} onCommit={join} disabledLabel={disabledLabel} />
      </div>

      {alreadyJoined && phase !== "error" && (
        <p className="mt-2.5 text-left text-[12px] font-medium text-[var(--gold-deep)]">
          ⚓ {msg || "This email is already on the waitlist — see you aboard soon."}
        </p>
      )}
      {phase === "error" && (
        <p className="mt-2.5 text-left text-[12px] font-mono text-[var(--ember)]">{msg}</p>
      )}
      <p className="mt-3 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
        No spam · Unsubscribe anytime
      </p>
    </div>
  );
}
