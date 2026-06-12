"use client";

import Reveal from "./Reveal";

/* Supported wallet connectors — the wallets users can import/connect from */
const WALLETS = [
  {
    name: "MetaMask",
    description: "The world's leading self-custody wallet",
    color: "#f6851b",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <path d="M36.4 3L22.2 13.4l2.6-6.1L36.4 3z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.6 3l14.1 10.5-2.5-6.2L3.6 3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M31.1 27.5l-3.8 5.8 8.2 2.3 2.3-8-6.7-.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.2 27.6l2.3 8 8.2-2.3-3.8-5.8-6.7.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.3 18.1l-2.2 3.4 7.9.3-.3-8.5-5.4 4.8z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M27.7 18.1l-5.5-4.9-.2 8.6 7.9-.3-2.2-3.4z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.7 33.3l4.7-2.3-4.1-3.2-.6 5.5z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22.6 31l4.7 2.3-.6-5.5-4.1 3.2z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Phantom",
    description: "Multi-chain wallet for EVM & Solana",
    color: "#ab9ff2",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="12" fill="#AB9FF2"/>
        <path d="M8 20.5C8 13.6 13.6 8 20.5 8c6.4 0 11.6 4.9 12.4 11.1h-4c-.8-4-4.3-7-8.4-7-4.7 0-8.5 3.8-8.5 8.5v.5H8v-.6z" fill="white"/>
        <path d="M14 22a2 2 0 100-4 2 2 0 000 4zM26 22a2 2 0 100-4 2 2 0 000 4z" fill="white"/>
        <path d="M12 26c1.6 3 4.8 5 8.5 5s6.9-2 8.5-5H12z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Coinbase Wallet",
    description: "Trusted by millions worldwide",
    color: "#0052ff",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="20" fill="#0052FF"/>
        <path d="M20 10C14.5 10 10 14.5 10 20s4.5 10 10 10 10-4.5 10-10S25.5 10 20 10zm0 4.5c3 0 5.5 2.5 5.5 5.5S23 25.5 20 25.5 14.5 23 14.5 20s2.5-5.5 5.5-5.5z" fill="white"/>
        <rect x="16" y="17.5" width="8" height="5" rx="2" fill="white"/>
      </svg>
    ),
  },
  {
    name: "WalletConnect",
    description: "Connect any compatible wallet",
    color: "#3b99fc",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="20" fill="#3B99FC"/>
        <path d="M12.5 17.5c4.1-4 10.9-4 15 0l.5.5a.5.5 0 010 .7l-1.7 1.6a.3.3 0 01-.4 0l-.7-.7c-2.9-2.7-7.5-2.7-10.4 0l-.7.7a.3.3 0 01-.4 0l-1.7-1.6a.5.5 0 010-.7l.5-.5zm18.5 3.4l1.5 1.5a.5.5 0 010 .7l-6.8 6.5a.5.5 0 01-.7 0l-4.8-4.6a.2.2 0 00-.3 0l-4.8 4.6a.5.5 0 01-.7 0l-6.8-6.5a.5.5 0 010-.7l1.5-1.5a.5.5 0 01.7 0l4.8 4.6c.1.1.2.1.3 0l4.8-4.6a.5.5 0 01.7 0l4.8 4.6c.1.1.2.1.3 0l4.8-4.6a.5.5 0 01.7 0z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "Rainbow",
    description: "The fun, simple Ethereum wallet",
    color: "#174299",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="20" fill="#174299"/>
        <path d="M8 24c0-6.6 5.4-12 12-12s12 5.4 12 12v2H28v-2a8 8 0 10-16 0v2H8v-2z" fill="url(#rainbow)"/>
        <defs>
          <linearGradient id="rainbow" x1="8" y1="24" x2="32" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF4D4D"/>
            <stop offset=".25" stopColor="#FF9A00"/>
            <stop offset=".5" stopColor="#FFD600"/>
            <stop offset=".75" stopColor="#00C4CC"/>
            <stop offset="1" stopColor="#6C00FF"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Rabby",
    description: "The go-to wallet for DeFi power users",
    color: "#8697ff",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="20" fill="#8697FF"/>
        <ellipse cx="20" cy="20" rx="10" ry="8" fill="white" fillOpacity=".9"/>
        <circle cx="16" cy="19" r="2" fill="#8697FF"/>
        <circle cx="24" cy="19" r="2" fill="#8697FF"/>
        <path d="M14 23c1.5 2 4.5 3 6 3s4.5-1 6-3" stroke="#8697FF" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 16c2-4 5-6 10-6s8 2 10 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    name: "Trust Wallet",
    description: "Simple, secure & multi-asset",
    color: "#3375bb",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="20" fill="#3375BB"/>
        <path d="M20 8l10 4v8c0 6-4.5 10.5-10 12-5.5-1.5-10-6-10-12V12l10-4z" fill="white" fillOpacity=".9"/>
        <path d="M16 20l3 3 5-6" stroke="#3375BB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "OKX Wallet",
    description: "Leading Web3 gateway from OKX",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect width="40" height="40" rx="20" fill="#000"/>
        <rect x="10" y="10" width="8" height="8" rx="1" fill="white"/>
        <rect x="22" y="10" width="8" height="8" rx="1" fill="white"/>
        <rect x="10" y="22" width="8" height="8" rx="1" fill="white"/>
        <rect x="22" y="22" width="8" height="8" rx="1" fill="white"/>
      </svg>
    ),
  },
];

export default function SupportedWallets() {
  return (
    <section
      id="supported"
      className="relative py-24 px-4 sm:px-6"
    >
      {/* Top divider */}
      <div
        className="mx-auto mb-20 max-w-6xl h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--line-md) 30%, var(--line-md) 70%, transparent)",
        }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <Reveal className="text-center mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-[var(--gold)] mb-3">
            ✦ Supported Wallets ✦
          </p>
          <h2
            className="font-display font-black tracking-[-0.03em] text-[var(--ink)]"
            style={{ fontSize: "clamp(30px, 4.5vw, 56px)" }}
          >
            Bring your own{" "}
            <em className="font-display font-light italic text-[var(--gold-deep)]">compass.</em>
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-[15px] leading-relaxed text-[var(--ink-soft)]">
            Menoid works with all the wallets you already trust. Import your existing wallet or
            connect any WalletConnect-compatible provider — no migration needed.
          </p>
        </Reveal>

        {/* Wallet grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {WALLETS.map((w, i) => (
            <Reveal key={w.name} delay={i * 55} variant="scale">
              <div
                className="card-lift group relative flex flex-col items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5 text-center cursor-default"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${w.color}10 0%, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)]"
                  style={{ background: "var(--bg-soft)" }}
                >
                  {w.icon}
                </div>

                {/* Name */}
                <div>
                  <p className="font-semibold text-[14px] text-[var(--ink)]">{w.name}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)] leading-snug">{w.description}</p>
                </div>

                {/* Status pill */}
                <div
                  className="mt-auto flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-2.5 py-0.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Supported</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* More wallets callout */}
        <Reveal delay={160} className="mt-8 text-center">
          <p className="text-[14px] text-[var(--ink-soft)]">
            + any wallet via{" "}
            <span className="font-semibold text-[var(--ink)]">WalletConnect</span> or{" "}
            <span className="font-semibold text-[var(--ink)]">browser injection</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
