"use client";

import { useEffect, useMemo, useState } from "react";

import { api, type Quote, type TokenConfig } from "@/lib/v1m/api";
import { maxSpendable } from "@/lib/v1m/build";
import { amountForInput, formatAmount, tryParseAmount, usdOf } from "@/lib/v1m/format";
import type { Menoid } from "./useMenoid";
import { AmountBox, BalanceHint, InfoRows, PanelAction, TokenIcon, TokenSelect, feeValue, useFeeQuote } from "./ui";

/* ────────────────────────────────────────────────────────────
   SWAP — private in, private out. Menoid picks the route (every
   fee tier, and two hops through a connector), the pool trades on
   Uniswap V3 itself, and the bought tokens land as a new private
   note. Nobody can link the trade to the wallet behind it.
   ──────────────────────────────────────────────────────────── */

const SLIPPAGES = [50, 100, 200];

export default function SwapPanel({ m }: { m: Menoid }) {
  const tokens = m.config!.tokens;
  const [tokenIn, setTokenIn] = useState<TokenConfig>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<TokenConfig>(tokens[1] ?? tokens[0]);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(100);
  const [quoted, setQuoted] = useState<{ key: string; quote?: Quote; error?: string } | null>(null);

  const privateBalance = m.view?.balances[tokenIn.address] ?? 0n;
  const parsed = tryParseAmount(amount, tokenIn.decimals);

  // a fresh quote, half a second after the user stops typing
  const quoteKey = parsed && parsed > 0n && tokenIn.address !== tokenOut.address ? `${tokenIn.address}:${tokenOut.address}:${parsed}` : null;
  useEffect(() => {
    if (!quoteKey) return;
    const [inAddr, outAddr, raw] = quoteKey.split(":");
    let live = true;
    const t = setTimeout(async () => {
      try {
        const q = await api.quote(inAddr, outAddr, BigInt(raw));
        if (live) setQuoted({ key: quoteKey, quote: q });
      } catch (e) {
        if (live) setQuoted({ key: quoteKey, error: (e as Error).message });
      }
    }, 500);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [quoteKey]);
  const current = quoteKey && quoted?.key === quoteKey ? quoted : null;
  const quote = current?.quote ?? null;
  const quoteError = current?.error ?? null;
  const quoting = Boolean(quoteKey) && !current;

  // a swap is one proof (up to 4 notes); its gas depends on the route's hops
  const feeQuote = useFeeQuote("swap", tokenIn.address, 1, quote?.fees.length ?? 1);
  const fee = feeQuote.quote ? BigInt(feeQuote.quote.feePerCall) : null;
  const max = m.view && fee !== null ? maxSpendable(m.view.unspent, tokenIn.address, fee, 1) : 0n;
  // quoted all along (Max needs it), shown once there is an amount and its route (the hops set the gas)
  const showFee = Boolean(parsed) && Boolean(quote);

  const amountOut = quote ? BigInt(quote.amountOut) : null;
  const minOut = amountOut ? (amountOut * BigInt(10_000 - slippage)) / 10_000n : null;
  const symbolOf = (address: string) => tokens.find((t) => t.address.toLowerCase() === address.toLowerCase())?.symbol ?? "?";

  const blocker = useMemo(() => {
    if (tokenIn.address === tokenOut.address) return "Pick two different tokens";
    if (!parsed || parsed === 0n) return "Enter an amount";
    if (feeQuote.error) return "The relayer's fee is unavailable";
    if (fee === null) return "Quoting the fee…";
    if (parsed + fee > privateBalance) return `Not enough private ${tokenIn.symbol}`;
    if (parsed > max) return `At most ${formatAmount(max, tokenIn.decimals)} ${tokenIn.symbol} in one swap`;
    if (quoting) return "Finding the best route…";
    if (quoteError) return "No route for this pair";
    if (!quote) return "Finding the best route…";
    return null;
  }, [tokenIn, tokenOut, parsed, fee, feeQuote.error, privateBalance, max, quoting, quoteError, quote]);

  const flip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmount("");
  };

  return (
    <div className="flex flex-col gap-1">
      <AmountBox
        label="You pay"
        value={amount}
        onChange={setAmount}
        usd={parsed ? usdOf(parsed, tokenIn.decimals, m.prices[tokenIn.address]) : 0}
        right={<TokenSelect tokens={tokens} value={tokenIn} onChange={(t) => { if (t.address === tokenOut.address) setTokenOut(tokenIn); setTokenIn(t); setAmount(""); }} balances={m.view?.balances} balanceLabel="Private" />}
        footer={m.phase === "ready" && <BalanceHint label="Private" amount={privateBalance} decimals={tokenIn.decimals} onMax={() => setAmount(amountForInput(max, tokenIn.decimals))} />}
      />

      <div className="relative z-10 -my-4 flex justify-center">
        <button
          type="button"
          onClick={flip}
          aria-label="Switch tokens"
          className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-[#5E40A8] shadow-[0_8px_18px_-8px_rgba(46,26,92,0.5)] ring-4 ring-[rgba(250,245,255,0.95)] transition-transform duration-300 hover:rotate-180 active:scale-90"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M5 3v12M5 15l-3-3M5 15l3-3M13 15V3M13 3l-3 3M13 3l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <AmountBox
        label="You receive"
        value={amountOut !== null ? amountForInput(amountOut, tokenOut.decimals) : quoting ? "…" : ""}
        readOnly
        usd={amountOut ? usdOf(amountOut, tokenOut.decimals, m.prices[tokenOut.address]) : 0}
        right={<TokenSelect tokens={tokens} value={tokenOut} onChange={(t) => { if (t.address === tokenIn.address) setTokenIn(tokenOut); setTokenOut(t); }} balances={m.view?.balances} balanceLabel="Private" />}
        footer={<span className="text-[#2E1A5C]/45">into a new private note</span>}
      />

      <div className="mt-2">
        <InfoRows
          rows={[
            {
              label: "Route",
              value: quote ? (
                <span className="inline-flex items-center gap-1.5">
                  {quote.tokens.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      {i > 0 && <span className="text-[11px] text-[#2E1A5C]/45">{(quote.fees[i - 1] / 10_000).toFixed(2).replace(/\.?0+$/, "")}% →</span>}
                      <TokenIcon symbol={symbolOf(t)} size={18} />
                    </span>
                  ))}
                </span>
              ) : (
                "—"
              ),
            },
            { label: `Minimum received (${slippage / 100}% slippage)`, value: minOut ? `${formatAmount(minOut, tokenOut.decimals)} ${tokenOut.symbol}` : "—", accent: Boolean(minOut) },
            { label: "Relayer fee", value: showFee ? feeValue(feeQuote.quote, feeQuote.error) : "—" },
          ]}
        />
      </div>

      <div className="my-2 flex items-center justify-between px-1 text-[12px] text-[#2E1A5C]/60">
        <span>Slippage</span>
        <div className="flex gap-1.5">
          {SLIPPAGES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlippage(s)}
              className="rounded-full px-3 py-1 font-semibold transition-colors"
              style={slippage === s ? { background: "#5E40A8", color: "#fff" } : { background: "rgba(117,86,207,0.1)", color: "#4E2F8E" }}
            >
              {s / 100}%
            </button>
          ))}
        </div>
      </div>

      <PanelAction
        m={m}
        label={blocker ?? `Swap ${formatAmount(parsed!, tokenIn.decimals)} ${tokenIn.symbol} privately`}
        disabled={Boolean(blocker)}
        onClick={async () => {
          if (parsed && (await m.swap(tokenIn, parsed, tokenOut, slippage))) setAmount("");
        }}
      />
    </div>
  );
}
