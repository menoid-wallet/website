"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ShipSlider, { type SliderPhase } from "./ShipSlider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared across every WaitlistForm instance for the current session (Hero + CTA
// stay in sync). A module variable resets on a full page reload, so the state is
// session-only — exactly the desired behaviour.
let sessionRegistered = false;
const REGISTERED_EVENT = "menoid:registered";

const FIELD_STYLE: React.CSSProperties = {
  background: "#FAF5E8",
  border: "1px solid rgba(163,110,20,0.22)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-xs)",
};

// Module-scope so the input keeps focus across re-renders (a nested component
// would remount on every keystroke).
function Field({
  id,
  label,
  optional,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  optional?: boolean;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="text-left">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold-deep)]"
      >
        {label}
        {optional && (
          <span className="font-sans tracking-normal text-[10px] normal-case text-[var(--muted)]">
            (optional)
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-[14.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none transition-all duration-200 focus:border-[rgba(200,146,14,0.6)] focus:shadow-[0_0_0_3px_rgba(232,174,58,0.18),0_1px_0_rgba(255,255,255,0.9)_inset]"
        style={FIELD_STYLE}
      />
    </div>
  );
}

export default function WaitlistForm({ inputId = "wl" }: { inputId?: string }) {
  // ── Modal state ──
  const [open, setOpen] = useState(false);
  // Session-only: flips true after a successful registration so the trigger shows
  // an "already registered" state. NOT persisted — a page reload resets it back
  // to the active Register button.
  const [registered, setRegistered] = useState(false);

  // ── Form fields ──
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [x, setX] = useState("");
  const [telegram, setTelegram] = useState("");
  const [discord, setDiscord] = useState("");

  const [emails, setEmails] = useState<string[]>([]);
  const [phase, setPhase] = useState<SliderPhase>("idle");
  const [msg, setMsg] = useState("");

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
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep every instance in sync if any one of them registers this session.
  useEffect(() => {
    if (sessionRegistered) setRegistered(true);
    const onReg = () => setRegistered(true);
    window.addEventListener(REGISTERED_EVENT, onReg);
    return () => window.removeEventListener(REGISTERED_EVENT, onReg);
  }, []);

  // Lock body scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "submitting") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, phase]);

  const normalized = email.toLowerCase().trim();
  const emailValid = EMAIL_RE.test(normalized);
  const nameValid = fullName.trim().length >= 2;
  const alreadyJoined = emailValid && emails.includes(normalized);
  const canSubmit =
    nameValid && emailValid && !alreadyJoined && phase !== "submitting" && phase !== "success";

  const join = async () => {
    if (!canSubmit) return;
    setPhase("submitting");
    setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/joinwaitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: normalized,
          x: x.trim(),
          telegram: telegram.trim(),
          discord: discord.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.joined) {
        setEmails((p) => [...p, normalized]);
        sessionRegistered = true;
        setRegistered(true);
        window.dispatchEvent(new Event(REGISTERED_EVENT)); // sync the other instance
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
      setMsg("Couldn't reach the server — make sure the backend is running.");
      setPhase("error");
    }
  };

  const disabledLabel = alreadyJoined
    ? "Already on the crew"
    : !nameValid
    ? "Enter your full name"
    : !emailValid
    ? "Enter a valid email"
    : "Drag the ship to join →";

  // Wrap a setter so typing also clears any prior error state.
  const handle = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (phase === "error") setPhase("idle");
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setX("");
    setTelegram("");
    setDiscord("");
    setMsg("");
    setPhase("idle");
  };

  const closeModal = () => {
    if (phase === "submitting") return;
    setOpen(false);
    // Leave a clean form behind once a registration succeeds.
    if (phase === "success") resetForm();
  };

  // ── Modal (portaled to <body> so it escapes every section's stacking context) ──
  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 wl-overlay"
      style={{ background: "rgba(23,19,17,0.5)", backdropFilter: "blur(6px)" }}
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-label="Register for Menoid V1 Early Access"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="wl-card relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl p-6 sm:p-7"
        style={{
          background: "linear-gradient(165deg, #FBF1D9 0%, #F6EACD 60%, #F0DFB6 100%)",
          border: "1px solid rgba(163,110,20,0.3)",
          boxShadow: "0 30px 80px rgba(23,19,17,0.35), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
      >
        {/* Close */}
        {phase !== "submitting" && (
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="btn-spring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--gold-deep)] outline-none"
            style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(163,110,20,0.22)" }}
          >
            ✕
          </button>
        )}

        {phase === "success" ? (
          // ── Success state ──
          <div className="py-6 text-center animate-fade-in">
            <div className="text-[40px]">🏴‍☠️</div>
            <p className="mt-2 font-display text-2xl font-bold text-[var(--gold-deep)]">
              You&apos;re on the crew!
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] text-[var(--ink-soft)]">{msg}</p>
            <button
              type="button"
              onClick={closeModal}
              className="btn-spring mt-6 inline-flex items-center justify-center rounded-[24px] px-6 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#3a2a0c] outline-none"
              style={{
                background: "linear-gradient(90deg, var(--gold-deep), var(--gold-bright) 55%, var(--gold-soft))",
                border: "1px solid rgba(163,110,20,0.5)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, var(--shadow-gold)",
              }}
            >
              Set sail ⚓
            </button>
          </div>
        ) : (
          // ── Form ──
          <>
            <div className="mb-5 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--gold-deep)]">
                ⚓ V1 Early Access
              </p>
              <h3 className="mt-1.5 font-display text-2xl font-black tracking-[-0.02em] text-[var(--ink)]">
                Join the crew
              </h3>
              <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                Secure your spot before V1 sets sail.
              </p>
            </div>

            <div className="space-y-3.5">
              <Field
                id={`${inputId}-fullname`}
                label="Full Name"
                placeholder="Jack Sparrow"
                value={fullName}
                onChange={handle(setFullName)}
                autoComplete="name"
              />
              <Field
                id={`${inputId}-email`}
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handle((v) => setEmail(v.toLowerCase()))}
                autoComplete="email"
              />
              <Field
                id={`${inputId}-x`}
                label="X"
                optional
                placeholder="@yourhandle"
                value={x}
                onChange={handle(setX)}
              />
              <Field
                id={`${inputId}-telegram`}
                label="Telegram Username"
                optional
                placeholder="@yourusername"
                value={telegram}
                onChange={handle(setTelegram)}
              />
              <Field
                id={`${inputId}-discord`}
                label="Discord Username"
                optional
                placeholder="yourusername"
                value={discord}
                onChange={handle(setDiscord)}
              />
            </div>

            {/* Ship slider */}
            <div className="mt-5">
              <ShipSlider
                canSubmit={canSubmit}
                phase={phase}
                onCommit={join}
                disabledLabel={disabledLabel}
              />
            </div>

            {alreadyJoined && phase !== "error" && (
              <p className="mt-2.5 text-center text-[12px] font-medium text-[var(--gold-deep)]">
                ⚓ {msg || "This email is already on the waitlist — see you aboard soon."}
              </p>
            )}
            {phase === "error" && (
              <p className="mt-2.5 text-center text-[12px] font-mono text-[var(--ember)]">{msg}</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Trigger ── */}
      {registered ? (
        // Session-only "already registered" state — reverts to the active button on reload.
        <div
          className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-[28px] px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[var(--gold-deep)]"
          style={{
            background: "#FAF5E8",
            border: "1px solid rgba(163,110,28,0.32)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, var(--shadow-gold)",
          }}
          aria-live="polite"
        >
          <span className="text-[14px] leading-none">🏴‍☠️</span>
          Already Registered
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-spring group relative inline-flex w-full max-w-md items-center justify-center gap-2 overflow-hidden rounded-[28px] px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-[0.22em] text-[#3a2a0c] outline-none"
          style={{
            background: "linear-gradient(90deg, var(--gold-deep), var(--gold-bright) 55%, var(--gold-soft))",
            border: "1px solid rgba(163,110,20,0.5)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.5) inset, var(--shadow-gold)",
          }}
        >
          <span className="wl-btn-sheen" aria-hidden />
          <span className="wl-anchor relative z-[1]" style={{ color: "#FBF1D9", lineHeight: 0 }}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            </svg>
          </span>
          <span className="relative z-[1]">Register for Early Access</span>
        </button>
      )}

      {open && typeof document !== "undefined" && createPortal(modal, document.body)}

      <style>{`
        /* The anchor "hook" glints — light cream glow, matching the roadmap anchor. */
        @keyframes wlAnchorShine {
          0%, 70%, 100% {
            filter: drop-shadow(0 0 4px rgba(251,241,217,0.5));
            transform: rotate(0deg) scale(1);
          }
          82% {
            filter: drop-shadow(0 0 10px rgba(251,241,217,1)) drop-shadow(0 0 16px rgba(251,241,217,0.85));
            transform: rotate(-9deg) scale(1.16);
          }
        }
        .wl-anchor {
          display: inline-block;
          animation: wlAnchorShine 2.6s ease-in-out infinite;
        }
        .group:hover .wl-anchor { transform: translateY(-1px) rotate(-6deg) scale(1.1); }

        /* Light sweep across the button. */
        @keyframes wlBtnSheen {
          0%   { transform: translateX(-160%) skewX(-18deg); }
          55%, 100% { transform: translateX(260%) skewX(-18deg); }
        }
        .wl-btn-sheen {
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 38%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: wlBtnSheen 3.4s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes wlCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wl-overlay { animation: fade-in 240ms var(--ease-out-quart) forwards; }
        .wl-card { animation: wlCardIn 320ms var(--ease-out-quart) forwards; }

        @media (prefers-reduced-motion: reduce) {
          .wl-anchor, .wl-btn-sheen, .wl-overlay, .wl-card { animation: none; }
        }
      `}</style>
    </>
  );
}
