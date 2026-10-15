"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";

import type { TokenConfig } from "@/lib/v1m/api";
import { callsNeeded, maxSpendable } from "@/lib/v1m/build";
import { amountForInput, formatAmount, tryParseAmount, usdOf } from "@/lib/v1m/format";
import { shortAddress } from "@/lib/v1m/wallet";
import type { Menoid } from "./useMenoid";
import { AmountBox, BalanceHint, Chip, InfoRows, PanelAction, TokenSelect, INK, feeValue, useFeeQuote } from "./ui";

/* ────────────────────────────────────────────────────────────
   UNMASK — back to the open: private balance → a public wallet
   (your own by default). The native coin (MON, ETH) comes out as itself.
   ──────────────────────────────────────────────────────────── */

export default function UnmaskPanel({ m }: { m: Menoid }) {
  const tokens = m.tokens;
  const [token, setToken] = useState<TokenConfig>(tokens[0]);
  const [amount, setAmount] = useState("");
  const [elsewhere, setElsewhere] = useState(false);
  const [to, setTo] = useState("");

  const unspent = useMemo(() => m.view?.unspent ?? [], [m.view]);
  const privateBalance = m.view?.balances[token.address] ?? 0n;
  const parsed = tryParseAmount(amount, token.decimals);
  const usd = parsed ? usdOf(parsed, token.decimals, m.prices[token.address]) : 0;
  const destination = elsewhere ? (ethers.isAddress(to.trim()) ? ethers.getAddress(to.trim()) : null) : m.address;

  const single = useFeeQuote(m.api, "withdraw", token.address, 1);
  const perCall = single.quote ? BigInt(single.quote.feePerCall) : null;
  const calls = parsed && perCall !== null ? (callsNeeded(unspent, token.address, parsed, perCall) ?? 1) : 1;
  const batched = useFeeQuote(m.api, "withdraw", calls > 1 ? token.address : undefined, calls);
  const fee = calls > 1 ? batched : single;
  const max = perCall !== null ? maxSpendable(unspent, token.address, perCall) : 0n;
  // quoted all along (Max needs it), shown once there is an amount and somewhere to send it
  const showFee = Boolean(parsed) && (!elsewhere || Boolean(destination));

  const blocker = useMemo(() => {
    if (!parsed || parsed === 0n) return "Enter an amount";
    if (fee.error) return "The relayer's fee is unavailable";
    if (!fee.quote || perCall === null) return "Quoting the fee…";
    if (parsed + BigInt(fee.quote.feeTotal) > privateBalance) return `Not enough private ${token.symbol}`;
    if (parsed > max) return `At most ${formatAmount(max, token.decimals)} ${token.symbol} in one go`;
    if (!destination) return "Enter a valid address";
    return null;
  }, [parsed, fee, perCall, privateBalance, max, token, destination]);

  return (
    <div className="flex flex-col gap-3">
      <AmountBox
        label="You're unmasking"
        value={amount}
        onChange={setAmount}
        usd={usd}
        right={<TokenSelect tokens={tokens} value={token} onChange={(t) => { setToken(t); setAmount(""); }} balances={m.view?.balances} balanceLabel="Private" blockReason={(t) => (t.relayable === false ? "No price yet for the relayer's fee" : null)} onLookup={m.lookupToken} onAdd={m.addToken} onRemove={m.removeToken} />}
        footer={m.phase === "ready" && <BalanceHint label="Private" amount={privateBalance} decimals={token.decimals} onMax={() => setAmount(amountForInput(max, token.decimals))} />}
      />

      <InfoRows
        rows={[
          { label: "Relayer fee", value: showFee ? feeValue(fee.quote, fee.error) : "—" },
          { label: "Total received", value: parsed ? `${formatAmount(parsed, token.decimals)} ${token.symbol}${token.native ? " (native)" : ""}` : "—", accent: Boolean(parsed) },
          {
            label: "Receiving address",
            value: (
              <button type="button" onClick={() => setElsewhere((v) => !v)} title={elsewhere ? "Back to my wallet" : "Unmask to another address"}>
                <Chip tone="violet">
                  {elsewhere ? (destination ? `Public wallet • ${shortAddress(destination)}` : "Another address") : m.address ? `Your wallet • ${shortAddress(m.address)}` : "Your wallet"}
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={`transition-transform ${elsewhere ? "rotate-180" : ""}`}>
                    <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </Chip>
              </button>
            ),
          },
        ]}
      />

      {elsewhere && (
        <input
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          placeholder="0x… address to receive it"
          spellCheck={false}
          className="w-full rounded-[16px] bg-white px-4 py-3 font-mono text-[13px] outline-none"
          style={{ border: `1.5px solid ${to && !destination ? "rgba(225,72,105,0.45)" : "rgba(78,47,142,0.12)"}`, color: INK }}
        />
      )}

      <PanelAction
        m={m}
        label={blocker ?? `Unmask ${formatAmount(parsed!, token.decimals)} ${token.symbol}`}
        disabled={Boolean(blocker)}
        onClick={async () => {
          if (parsed && destination && (await m.unmask(token, parsed, destination))) setAmount("");
        }}
      />
    </div>
  );
}
