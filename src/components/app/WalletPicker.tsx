"use client";

import { useEffect, useState } from "react";

import { watchWallets, type WalletOption } from "@/lib/v1m/wallet";
import { LAST_WALLET_KEY } from "./useMenoid";
import { CARD } from "./ui";

/* ────────────────────────────────────────────────────────────
   Choose a wallet. Every installed wallet announces itself
   (EIP-6963) with its own name and icon, so MetaMask, Phantom,
   Rabby, Coinbase … each get a row and the user picks — instead
   of whichever extension grabbed window.ethereum last.
   ──────────────────────────────────────────────────────────── */

const INSTALL = [
  { name: "MetaMask", href: "https://metamask.io/download/" },
  { name: "Rabby", href: "https://rabby.io/" },
  { name: "Phantom", href: "https://phantom.com/download" },
];

function WalletIcon({ wallet }: { wallet: WalletOption }) {
  if (wallet.icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={wallet.icon} alt="" className="h-10 w-10 rounded-[12px] object-contain" />;
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-[12px] font-round text-[17px] font-bold text-white" style={{ background: "linear-gradient(145deg, #B49CFF 0%, #6E54FF 100%)" }}>
      {wallet.name.slice(0, 1)}
    </span>
  );
}

export default function WalletPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (wallet: WalletOption) => void }) {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [searched, setSearched] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const stop = watchWallets((list) => setWallets(list));
    const done = window.setTimeout(() => setSearched(true), 400);
    const read = window.setTimeout(() => {
      try {
        setLast(localStorage.getItem(LAST_WALLET_KEY));
      } catch {
        // storage blocked: no "last used" hint
      }
    }, 0);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      stop();
      window.clearTimeout(done);
      window.clearTimeout(read);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  // the last used wallet first
  const sorted = [...wallets].sort((a, b) => Number(b.id === last) - Number(a.id === last));

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center px-3 pb-3 sm:items-center sm:pb-0" role="dialog" aria-modal="true" aria-label="Choose a wallet">
      <div className="absolute inset-0 bg-[rgba(46,26,92,0.32)] backdrop-blur-[6px]" style={{ animation: "app-fade 260ms ease both" }} onClick={onClose} />
      <div className="relative w-full max-w-[400px] rounded-[30px] p-5" style={{ ...CARD, animation: "app-rise 460ms cubic-bezier(0.22,1,0.36,1) both" }}>
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#7556CF]">Connect</p>
            <h2 className="font-round text-[21px] font-semibold tracking-[-0.02em] text-[#2E1A5C]">Choose a wallet</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4E2F8E] shadow-sm transition-transform hover:rotate-90">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2" data-lenis-prevent>
          {sorted.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onPick(w)}
              className="group flex items-center gap-3 rounded-[20px] px-3 py-3 text-left transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(243,234,255,0.85)", border: "1px solid rgba(78,47,142,0.07)" }}
            >
              <WalletIcon wallet={w} />
              <span className="min-w-0 flex-1">
                <span className="block font-round text-[15.5px] font-semibold text-[#2E1A5C]">{w.name}</span>
                <span className="block text-[11.5px] text-[#2E1A5C]/50">{w.id === last ? "Last used" : w.id === "injected" ? "Browser wallet" : "Detected"}</span>
              </span>
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="text-[#4E2F8E]/40 transition-transform group-hover:translate-x-0.5">
                <path d="M1.5 1.5L6 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}

          {searched && wallets.length === 0 && (
            <div className="rounded-[20px] px-4 py-4 text-center" style={{ background: "rgba(243,234,255,0.85)" }}>
              <p className="text-[14px] font-semibold text-[#2E1A5C]">No wallet found in this browser</p>
              <p className="mt-1 text-[12.5px] text-[#2E1A5C]/60">Install one, then come back:</p>
              <div className="mt-3 flex justify-center gap-2">
                {INSTALL.map((i) => (
                  <a key={i.name} href={i.href} target="_blank" rel="noreferrer" className="rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#5E40A8] shadow-sm">
                    {i.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 px-1 text-center text-[11.5px] leading-relaxed text-[#2E1A5C]/50">
          Menoid only asks your wallet to sign. Your private keys are made from one signature and never leave this tab.
        </p>
      </div>
    </div>
  );
}
