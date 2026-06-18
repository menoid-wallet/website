"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useRef, useState } from "react";

const PRODUCT_LINKS = [
  { label: "Wallet", href: "#top" },
  { label: "Open Mode", href: "#wallet-modes" },
  { label: "Noid Mode", href: "#wallet-modes" },
  { label: "Roadmap", href: "#roadmap" },
];

const DEV_LINKS = ["Docs", "SDK", "Audits", "GitHub"];

const ghIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
  </svg>
);
const xIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M11.4716 8.83372L17.9592 1.25H16.4468L10.7786 7.85685L6.26855 1.25H1.25L8.05416 11.0031L1.25 18.75H2.76286L8.74434 11.7901L13.5014 18.75H18.75L11.4716 8.83372ZM9.49425 10.9012L8.83317 9.95466L3.30218 2.35566H5.55005L10.084 8.78281L10.7451 9.72931L16.4474 17.6944H14.1996L9.49425 10.9012Z" />
  </svg>
);
const discordIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M16.9308 3.5C15.6561 2.9219 14.2892 2.5 12.8462 2.5C12.6831 2.7831 12.4877 3.1546 12.3508 3.45C10.8277 3.2154 9.31846 3.2154 7.81308 3.45C7.67615 3.1546 7.47615 2.7831 7.31615 2.5C5.87077 2.5 4.50384 2.9219 3.22923 3.5C0.653077 7.35 -0.0015385 11.0985 0.33 14.7931C2.05385 16.0754 3.72308 16.8592 5.36 17.3731C5.77 16.8131 6.13846 16.2181 6.45846 15.5931C5.86308 15.3692 5.29538 15.09 4.76154 14.7631C4.89231 14.6638 5.02308 14.559 5.14769 14.4546C8.37231 15.9746 11.9031 15.9746 15.0862 14.4546C15.2108 14.559 15.3415 14.6638 15.4723 14.7631C14.9385 15.09 14.3708 15.3692 13.7754 15.5931C14.0954 16.2181 14.4638 16.8131 14.8738 17.3731C16.5108 16.8592 18.18 16.0754 19.9038 14.7931C20.3023 10.5085 19.2215 6.7954 16.9308 3.5ZM6.68 12.4731C5.69538 12.4731 4.88615 11.5777 4.88615 10.4823C4.88615 9.38692 5.67769 8.49154 6.68 8.49154C7.68231 8.49154 8.49154 9.38692 8.47385 10.4823C8.47385 11.5777 7.67462 12.4731 6.68 12.4731ZM13.32 12.4731C12.3354 12.4731 11.5262 11.5777 11.5262 10.4823C11.5262 9.38692 12.3177 8.49154 13.32 8.49154C14.3223 8.49154 15.1315 9.38692 15.1138 10.4823C15.1138 11.5777 14.3223 12.4731 13.32 12.4731Z" />
  </svg>
);
const telegramIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M10 0C4.478 0 0 4.478 0 10s4.478 10 10 10 10-4.478 10-10S15.522 0 10 0zm4.938 6.847l-1.69 7.962c-.122.569-.461.706-.933.44l-2.573-1.896-1.241 1.196c-.137.137-.252.252-.515.252l.183-2.603 4.737-4.28c.206-.183-.046-.283-.317-.1L5.33 12.43l-2.531-.79c-.549-.172-.561-.549.116-.812l9.882-3.809c.457-.165.858.113.14.828z" />
  </svg>
);

export default function Footer() {
  const [toast, setToast] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = () => {
    setToast(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 2200);
  };
  const soon = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast();
  };

  const socialClass =
    "grid h-9 w-9 place-items-center rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] font-mono text-[10px] font-bold text-[rgba(251,241,217,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--gold-bright)] hover:bg-[rgba(255,255,255,0.08)]";

  return (
    <footer
      id="learn"
      className="relative mt-0 border-t border-[rgba(255,255,255,0.08)] py-16 overflow-hidden"
      style={{ background: "#171311" }}
    >
      {/* Subtle Grid Blueprint */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(to right,#FBF1D9 1px,transparent 1px),linear-gradient(to bottom,#FBF1D9 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.8fr_1fr_1fr]">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-[rgba(255,255,255,0.15)]"
                  style={{ background: "#171311", boxShadow: "var(--shadow-sm)" }}
                >
                  <Image src="/meno/meno_logo.png" alt="" fill sizes="40px" className="object-cover" />
                </div>
                <span className="font-display text-2xl font-bold tracking-tight text-[#FBF1D9]">Menoid</span>
              </div>
              <p className="max-w-xs text-[14px] leading-relaxed text-[rgba(251,241,217,0.7)]">
                The AI-native private crypto wallet.
              </p>

              <div className="mt-6 flex gap-2">
                <a href="https://github.com/menoid-wallet/" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={socialClass}>
                  {ghIcon}
                </a>
                <a href="https://x.com/MenoidWallet" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className={socialClass}>
                  {xIcon}
                </a>
                <button type="button" onClick={showToast} aria-label="Discord (coming soon)" className={socialClass}>
                  {discordIcon}
                </button>
                <button type="button" onClick={showToast} aria-label="Telegram (coming soon)" className={socialClass}>
                  {telegramIcon}
                </button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.32em] text-[rgba(251,241,217,0.4)] mb-4">Product</h4>
              <ul className="space-y-2.5">
                {PRODUCT_LINKS.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-[14px] text-[rgba(251,241,217,0.7)] transition-colors duration-200 hover:text-[#FBF1D9] link-underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.32em] text-[rgba(251,241,217,0.4)] mb-4">Developers</h4>
              <ul className="space-y-2.5">
                {DEV_LINKS.map((label) => (
                  <li key={label}>
                    <a href="#" onClick={soon} className="text-[14px] text-[rgba(251,241,217,0.7)] transition-colors duration-200 hover:text-[#FBF1D9] link-underline">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-8 md:flex-row">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[rgba(251,241,217,0.4)]">
            © {new Date().getFullYear()} Menoid · AI-native private crypto wallet
          </p>
          <div className="flex gap-6 text-[12px] text-[rgba(251,241,217,0.7)]">
            <a href="#" onClick={soon} className="hover:text-[#FBF1D9] transition-colors">Privacy</a>
            <a href="#" onClick={soon} className="hover:text-[#FBF1D9] transition-colors">Terms</a>
            <a href="#" onClick={soon} className="hover:text-[#FBF1D9] transition-colors">Disclosures</a>
          </div>
        </div>
      </div>

      {/* Coming-soon toast — light theme, centered */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
        aria-live="polite"
      >
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-300"
          style={{
            opacity: toast ? 1 : 0,
            transform: toast ? "translateY(0)" : "translateY(12px)",
            background: "rgba(251,241,217,0.97)",
            border: "1px solid rgba(163,110,20,0.3)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.8) inset",
            color: "var(--ink)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="text-[var(--gold-deep)]">⚓</span> Coming soon
        </div>
      </div>
    </footer>
  );
}
