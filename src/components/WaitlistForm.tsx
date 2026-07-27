"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CloudChip from "./CloudChip";
import AnimatedLogo from "./AnimatedLogo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5010";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Phase = "idle" | "submitting" | "success" | "error";

// Shared across every WaitlistForm instance for the current session (Hero + CTA
// stay in sync). A module variable resets on a full page reload, so the state is
// session-only — exactly the desired behaviour.
let sessionRegistered = false;
const REGISTERED_EVENT = "menoid:registered";

const FIELD_STYLE: React.CSSProperties = {
  background: "#F7F2FF",
  border: "1px solid rgba(78,47,142,0.22)",
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
        className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--violet-deep)]"
      >
        {label}
        {optional && (
          <span className="font-sans tracking-normal text-[10px] normal-case text-[rgba(78,47,142,0.5)]">
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
        className="w-full rounded-xl px-4 py-2.5 text-[14.5px] text-[var(--violet-deep)] placeholder-[rgba(78,47,142,0.4)] outline-none transition-all duration-200 focus:border-[rgba(94,64,168,0.6)] focus:shadow-[0_0_0_3px_rgba(159,125,249,0.2),0_1px_0_rgba(255,255,255,0.9)_inset]"
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
  const [phase, setPhase] = useState<Phase>("idle");
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
        setMsg(data.message || "You're registered for V1.");
        setPhase("success");
      } else if (res.ok && !data.joined) {
        setEmails((p) => (p.includes(normalized) ? p : [...p, normalized]));
        setMsg(data.message || "You're already registered!");
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
    ? "Already registered"
    : !nameValid
    ? "Enter your full name"
    : !emailValid
    ? "Enter a valid email"
    : "Register";

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

  // A reusable cloud-shaped button.
  const CloudButton = ({
    label,
    onClick,
    disabled,
    tone = "light",
  }: {
    label: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    tone?: "violet" | "light";
  }) => (
    /* white cloud by default, with violet ink */
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-spring group relative block w-full outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <CloudChip tone={tone} className="w-full justify-center px-6 py-3">
        <span
          className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.22em]"
          style={{ color: tone === "violet" ? "#F6EFFF" : "var(--violet-deep)" }}
        >
          {label}
        </span>
      </CloudChip>
    </button>
  );

  // ── Modal (portaled to <body> so it escapes every section's stacking context) ──
  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 wl-overlay"
      style={{ background: "rgba(30,14,70,0.55)", backdropFilter: "blur(6px)" }}
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-label="Register for Menoid V1"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="wl-card relative w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl p-6 sm:p-7"
        style={{
          background: "linear-gradient(165deg, #F7F2FF 0%, #ECE0FC 60%, #DCCDF7 100%)",
          border: "1px solid rgba(78,47,142,0.28)",
          boxShadow: "0 30px 80px rgba(30,14,70,0.4), 0 1px 0 rgba(255,255,255,0.85) inset",
        }}
      >
        {/* Close */}
        {phase !== "submitting" && (
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="btn-spring absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--violet-deep)] outline-none"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(78,47,142,0.22)" }}
          >
            ✕
          </button>
        )}

        {phase === "success" ? (
          // ── Success state ──
          <div className="py-6 text-center animate-fade-in">
            <AnimatedLogo className="mx-auto h-[160px] w-[160px]" />
            <p className="mt-3 font-display text-2xl font-bold text-[var(--violet-deep)]">
              You&apos;re registered!
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] text-[rgba(59,37,112,0.75)]">{msg}</p>
            <div className="mx-auto mt-6 max-w-[220px]">
              <CloudButton label={<>Done ✦</>} onClick={closeModal} />
            </div>
          </div>
        ) : (
          // ── Form ──
          <>
            <div className="mb-5 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--violet-deep)]">
                ✦ V1 Register
              </p>
              <h3 className="mt-1.5 font-display text-2xl font-black tracking-[-0.02em] text-[var(--violet-deep)]">
                Register for V1
              </h3>
              <p className="mt-1 text-[13px] text-[rgba(59,37,112,0.7)]">
                Secure your spot before V1 launches.
              </p>
            </div>

            <div className="space-y-3.5">
              <Field
                id={`${inputId}-fullname`}
                label="Full Name"
                placeholder="Your name"
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

            {/* Cloud register button (replaces the ship slider) */}
            <div className="mt-5">
              <CloudButton
                label={phase === "submitting" ? "Registering…" : "V1 Register"}
                onClick={join}
                disabled={!canSubmit}
              />
              {!canSubmit && phase !== "submitting" && (
                <p className="mt-2.5 text-center text-[11px]" style={{ color: "rgba(78,47,142,0.6)" }}>
                  {disabledLabel}
                </p>
              )}
            </div>

            {alreadyJoined && phase !== "error" && (
              <p className="mt-2.5 text-center text-[12px] font-medium text-[var(--violet-deep)]">
                ✦ {msg || "This email is already registered — see you at launch."}
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
        <div className="inline-flex w-full max-w-md">
          <CloudChip tone="light" className="w-full justify-center px-6 py-3.5">
            <span
              className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.22em]"
              style={{ color: "var(--violet-deep)" }}
              aria-live="polite"
            >
              <span className="text-[14px] leading-none">✦</span>
              Already Registered
            </span>
          </CloudChip>
        </div>
      ) : (
        <div className="inline-flex w-full max-w-md">
          <CloudButton label={<><span className="text-[13px] leading-none">✦</span> V1 Register</>} onClick={() => setOpen(true)} />
        </div>
      )}

      {open && typeof document !== "undefined" && createPortal(modal, document.body)}

      <style>{`
        @keyframes wlCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wl-overlay { animation: fade-in 240ms var(--ease-out-quart) forwards; }
        .wl-card { animation: wlCardIn 320ms var(--ease-out-quart) forwards; }

        @media (prefers-reduced-motion: reduce) {
          .wl-overlay, .wl-card { animation: none; }
        }
      `}</style>
    </>
  );
}
