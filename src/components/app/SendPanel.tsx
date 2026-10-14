"use client";

import { useMemo, useState } from "react";

import type { TokenConfig } from "@/lib/v1m/api";
import { callsNeeded, maxSpendable } from "@/lib/v1m/build";
import { amountForInput, formatAmount, tryParseAmount, usdOf } from "@/lib/v1m/format";
import type { Menoid } from "./useMenoid";
import { AddressField, AmountBox, BalanceHint, InfoRows, PanelAction, TokenSelect, feeValue, useFeeQuote, useRecipient } from "./ui";

/* ────────────────────────────────────────────────────────────
   SEND — from the private balance to any address.
   Registered recipient: a private transfer (nobody sees who or how
   much). Unregistered: the pool pays them straight into their
   public wallet, and the sender stays private.
   More than 4 notes needed: several proofs, one transaction.
   ──────────────────────────────────────────────────────────── */

export default function SendPanel({ m }: { m: Menoid }) {
  const tokens = m.config!.tokens;
  const [token, setToken] = useState<TokenConfig>(tokens[0]);
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const recipient = useRecipient(to, m.config?.pool);

  const kind = recipient.status === "unregistered" ? "withdraw" : "transfer";
  const unspent = useMemo(() => m.view?.unspent ?? [], [m.view]);
  const privateBalance = m.view?.balances[token.address] ?? 0n;
  const parsed = tryParseAmount(amount, token.decimals);
  const usd = parsed ? usdOf(parsed, token.decimals, m.prices[token.address]) : 0;
  const isPublic = recipient.status === "unregistered";

  // the fee for one proof decides how many proofs are needed; then quote that many
  const single = useFeeQuote(kind, token.address, 1);
  const perCall = single.quote ? BigInt(single.quote.feePerCall) : null;
  const calls = parsed && perCall !== null ? (callsNeeded(unspent, token.address, parsed, perCall) ?? 1) : 1;
  const batched = useFeeQuote(kind, calls > 1 ? token.address : undefined, calls);
  const fee = calls > 1 ? batched : single;
  const max = perCall !== null ? maxSpendable(unspent, token.address, perCall) : 0n;
  // quoted all along (Max needs it), shown once there is an amount and a recipient
  const showFee = Boolean(parsed) && (recipient.status === "registered" || recipient.status === "unregistered");

  const blocker = useMemo(() => {
    if (!parsed || parsed === 0n) return "Enter an amount";
    if (fee.error) return "The relayer's fee is unavailable";
    if (!fee.quote || perCall === null) return "Quoting the fee…";
    if (parsed + BigInt(fee.quote.feeTotal) > privateBalance) return `Not enough private ${token.symbol}`;
    if (parsed > max) return `At most ${formatAmount(max, token.decimals)} ${token.symbol} in one go`;
    if (recipient.status === "empty") return "Enter the recipient's address";
    if (recipient.status === "invalid") return "Not a valid address";
    if (recipient.status === "checking") return "Checking the recipient…";
    if (recipient.status === "error") return "Could not check the recipient";
    return null;
  }, [parsed, fee, perCall, privateBalance, max, token, recipient]);

  return (
    <div className="flex flex-col gap-3">
      <AmountBox
        label="You're sending"
        value={amount}
        onChange={setAmount}
        usd={usd}
        right={<TokenSelect tokens={tokens} value={token} onChange={(t) => { setToken(t); setAmount(""); }} balances={m.view?.balances} balanceLabel="Private" />}
        footer={m.phase === "ready" && <BalanceHint label="Private" amount={privateBalance} decimals={token.decimals} onMax={() => setAmount(amountForInput(max, token.decimals))} />}
      />

      <div className="rounded-[24px] px-5 pb-2 pt-4" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(78,47,142,0.08)" }}>
        <p className="mb-2 text-[13px] font-medium text-[#2E1A5C]/70">To</p>
        <AddressField
          value={to}
          onChange={setTo}
          state={recipient}
          hints={{ registered: "Registered — sent privately", unregistered: "Not registered — it arrives directly in their public wallet", unregisteredTone: "amber" }}
        />
      </div>

      <InfoRows
        rows={[
          { label: "Relayer fee", value: showFee ? feeValue(fee.quote, fee.error) : "—" },
          { label: "They receive", value: parsed ? `${formatAmount(parsed, token.decimals)} ${token.symbol}${isPublic && token.native ? " (native)" : ""}` : "—", accent: Boolean(parsed) },
          { label: "Delivery", value: recipient.status === "registered" ? "Private note" : isPublic ? "Their public wallet" : "—" },
        ]}
      />

      <PanelAction
        m={m}
        label={blocker ?? (isPublic ? `Send ${formatAmount(parsed!, token.decimals)} ${token.symbol} to their wallet` : `Send ${formatAmount(parsed!, token.decimals)} ${token.symbol} privately`)}
        disabled={Boolean(blocker)}
        onClick={async () => {
          if (!parsed || (recipient.status !== "registered" && recipient.status !== "unregistered")) return;
          if (await m.send(token, parsed, recipient.address)) {
            setAmount("");
            setTo("");
          }
        }}
        note={<p className="text-center text-[12px] text-[#2E1A5C]/50">Your address never appears on-chain — the relayer submits it and is paid from the note.</p>}
      />
    </div>
  );
}
