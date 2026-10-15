"use client";

import { useMemo, useState } from "react";
import { ethers } from "ethers";

import type { TokenConfig } from "@/lib/v1m/api";
import { amountForInput, formatAmount, tryParseAmount, usdOf } from "@/lib/v1m/format";
import { shortAddress } from "@/lib/v1m/wallet";
import type { Menoid } from "./useMenoid";
import { AddressField, AmountBox, BalanceHint, Chip, InfoRows, PanelAction, TokenSelect, useRecipient } from "./ui";

/* ────────────────────────────────────────────────────────────
   MASK — move a token from the public wallet into a private
   balance. The wallet pops up once (twice for a token it has not
   approved yet) and signs; nothing else is needed.
   It can mask straight into another registered user's balance.
   ──────────────────────────────────────────────────────────── */

export default function MaskPanel({ m }: { m: Menoid }) {
  const tokens = m.tokens;
  const [token, setToken] = useState<TokenConfig>(tokens[0]);
  const [amount, setAmount] = useState("");
  const [toOther, setToOther] = useState(false);
  const [recipient, setRecipient] = useState("");
  const recipientState = useRecipient(toOther ? recipient : "", m.config);

  const parsed = tryParseAmount(amount, token.decimals);
  const publicBalance = m.publicBalances[token.address] ?? 0n;
  // keep a little of the native coin back for gas when masking it (per chain: 0.3 MON, 0.0005 ETH)
  const gasReserve = ethers.parseEther(m.config!.gasReserve ?? "0");
  // Monad: a smart account (EIP-7702) must always keep 10 MON when MON leaves it
  const smartReserve = token.native && m.smartAccount ? ethers.parseEther(m.config!.reserveBalance ?? "0") : 0n;
  const keep = smartReserve > gasReserve ? smartReserve : gasReserve;
  const maxAmount = token.native ? (publicBalance > keep ? publicBalance - keep : 0n) : publicBalance;
  const usd = parsed ? usdOf(parsed, token.decimals, m.prices[token.address]) : 0;

  const self = m.address; // null until a wallet is connected
  const toSelf = !toOther || (recipientState.status === "registered" && recipientState.address === self);

  const blocker = useMemo(() => {
    if (!parsed || parsed === 0n) return "Enter an amount";
    if (parsed > publicBalance) return `Not enough ${token.symbol} in your wallet`;
    if (token.native && parsed > maxAmount) return smartReserve > 0n ? `Keep ${m.config!.reserveBalance} ${token.symbol} in your smart account` : `Leave a little ${token.symbol} for gas`;
    if (toOther) {
      if (recipientState.status === "empty") return "Paste the recipient's address";
      if (recipientState.status === "invalid") return "Not a valid address";
      if (recipientState.status === "checking") return "Checking the recipient…";
      if (recipientState.status === "unregistered") return "That address is not registered";
      if (recipientState.status === "error") return "Could not check the recipient";
    }
    return null;
  }, [parsed, publicBalance, maxAmount, smartReserve, m.config, token, toOther, recipientState]);

  const receivingLabel = toSelf
    ? self
      ? `Private account • ${shortAddress(self)}`
      : "Your private account"
    : recipientState.status === "registered"
      ? `Private account • ${shortAddress(recipientState.address)}`
      : "—";

  return (
    <div className="flex flex-col gap-3">
      <AmountBox
        label="You're masking"
        value={amount}
        onChange={setAmount}
        usd={usd}
        right={<TokenSelect tokens={tokens} value={token} onChange={(t) => { setToken(t); setAmount(""); }} balances={m.publicBalances} balanceLabel="Public" blockReason={(t) => (t.enabled === false ? "Not accepted by the pool yet" : null)} onLookup={m.lookupToken} onAdd={m.addToken} onRemove={m.removeToken} />}
        footer={m.phase === "ready" && <BalanceHint label="Wallet" amount={publicBalance} decimals={token.decimals} onMax={() => setAmount(amountForInput(maxAmount, token.decimals))} />}
      />

      <InfoRows
        rows={[
          { label: "Total fee", value: token.native ? `Gas only · paid in ${token.symbol}` : "Gas only · approve + mask" },
          { label: "Total received", value: parsed ? `${formatAmount(parsed, token.decimals)} ${token.symbol}` : "—", accent: Boolean(parsed) },
          {
            label: "Receiving address",
            value: (
              <button type="button" onClick={() => setToOther((v) => !v)} title={toOther ? "Mask into my own balance" : "Mask into someone else's balance"}>
                <Chip tone="violet">
                  {receivingLabel}
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className={`transition-transform ${toOther ? "rotate-180" : ""}`}>
                    <path d="M1.5 3.5L5 7L8.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </Chip>
              </button>
            ),
          },
        ]}
      />

      {toOther && (
        <div className="rounded-[24px] px-5 pb-2 pt-4" style={{ background: "rgba(255,255,255,0.55)", border: "1px dashed rgba(78,47,142,0.18)" }}>
          <p className="mb-2 text-[13px] font-medium text-[#2E1A5C]/70">Hide it for someone else</p>
          <AddressField
            value={recipient}
            onChange={setRecipient}
            state={recipientState}
            hints={{ registered: "Registered — it lands in their private balance", unregistered: "Not registered with Menoid — they can't receive a masked balance", unregisteredTone: "rose" }}
          />
        </div>
      )}

      <PanelAction
        m={m}
        label={blocker ?? `Mask ${formatAmount(parsed!, token.decimals)} ${token.symbol}`}
        disabled={Boolean(blocker)}
        onClick={async () => {
          if (parsed && (await m.mask(token, parsed, toOther && recipientState.status === "registered" ? recipientState.address : undefined))) setAmount("");
        }}
      />

      {smartReserve > 0n && m.phase === "ready" && (
        <p className="text-center text-[12px] leading-relaxed text-[#2E1A5C]/55">
          Your wallet is a smart account (EIP-7702), and {m.config!.name} makes smart accounts keep {m.config!.reserveBalance} {token.symbol}, so up to{" "}
          {formatAmount(maxAmount, token.decimals)} {token.symbol} can be masked. Switch it back to a standard account in your wallet to mask more.
        </p>
      )}
      {token.faucet && m.phase === "ready" && (
        <p className="text-center text-[12px] text-[#2E1A5C]/55">
          Testnet token.{" "}
          <button type="button" onClick={() => m.mintTestTokens(token)} className="font-semibold text-[#5E40A8] underline decoration-dotted underline-offset-4">
            Mint 1,000 test {token.symbol}
          </button>
        </p>
      )}
      {token.faucetUrl && (
        <p className="text-center text-[12px] text-[#2E1A5C]/55">
          Testnet token.{" "}
          <a href={token.faucetUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#5E40A8] underline decoration-dotted underline-offset-4">
            Get test {token.symbol} from its faucet ↗
          </a>
        </p>
      )}
    </div>
  );
}
