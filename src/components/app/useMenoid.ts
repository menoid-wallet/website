"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

import { api, ApiError, type AppConfig, type TokenConfig } from "@/lib/v1m/api";
import { deriveKeysFromSignature, keyMessage, type PrivateKeys } from "@/lib/v1m/protocol";
import { Mirror, scan, type WalletView } from "@/lib/v1m/mirror";
import { buildDeposit, buildSwap, buildTransfer, buildWithdraw, pickNotes, type Recipient } from "@/lib/v1m/build";
import { preloadProver, proveInBrowser } from "@/lib/v1m/prover";
import * as W from "@/lib/v1m/wallet";
import { formatAmount } from "@/lib/v1m/format";

/**
 * The private app's session: connect → sign once → sync → act.
 *
 * Keys live only in memory for this tab. They come from one signature of the
 * key message (testnet keys on testnet), so a reload just asks for it again.
 */

export type Phase = "idle" | "connecting" | "signing" | "syncing" | "unregistered" | "ready";

export type TxKind = "register" | "mask" | "send" | "swap" | "unmask";
export type TxState = {
  kind: TxKind;
  title: string;
  steps: string[];
  step: number;
  status: "running" | "success" | "error";
  message: string;
  txHash?: string;
  result?: string;
  error?: string;
};

const SYNC_MS = 8_000;
const PRICE_MS = 30_000;

const rejected = (e: unknown) => {
  const err = e as { code?: number | string; message?: string; info?: { error?: { code?: number } } };
  return err?.code === 4001 || err?.code === "ACTION_REJECTED" || err?.info?.error?.code === 4001 || /user (rejected|denied)/i.test(err?.message || "");
};

export function friendlyError(e: unknown): string {
  if (rejected(e)) return "You cancelled it in your wallet.";
  if (e instanceof ApiError) return e.message;
  const err = e as { shortMessage?: string; reason?: string; message?: string };
  const text = err?.shortMessage || err?.reason || err?.message || String(e);
  if (/insufficient funds/i.test(text)) return "Not enough MON in your wallet to pay for gas.";
  return text.length > 220 ? text.slice(0, 220) + "…" : text;
}

export function useMenoid() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [keys, setKeys] = useState<PrivateKeys | null>(null);
  const [view, setView] = useState<WalletView | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [publicBalances, setPublicBalances] = useState<Record<string, bigint>>({});
  const [wrongChain, setWrongChain] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tx, setTx] = useState<TxState | null>(null);

  const ethRef = useRef<W.Eip1193 | null>(null);
  const mirrorRef = useRef<Mirror>(new Mirror());
  const signatureRef = useRef<string | null>(null);
  const lastTxBlockRef = useRef<number | null>(null);
  const keysRef = useRef<PrivateKeys | null>(null);
  keysRef.current = keys;

  // the config is public: load it right away, so the page can show tokens and fees
  useEffect(() => {
    api.config().then(setConfig).catch(() => {});
  }, []);

  /* ─── sync ───────────────────────────────────────────────────────── */

  const syncNow = useCallback(async (k: PrivateKeys | null = keysRef.current) => {
    if (!k) return null;
    setSyncing(true);
    try {
      await mirrorRef.current.sync((since) => api.sync(since));
      const v = scan(mirrorRef.current, k);
      setView(v);
      return v;
    } finally {
      setSyncing(false);
    }
  }, []);

  const refreshPublic = useCallback(async (addr: string | null = address, cfg: AppConfig | null = config) => {
    if (!addr || !cfg) return;
    const entries = await Promise.all(
      cfg.tokens.map(async (t) => [t.address, await W.publicBalance(t, addr).catch(() => 0n)] as const)
    );
    setPublicBalances(Object.fromEntries(entries));
  }, [address, config]);

  const refreshPrices = useCallback(async () => {
    try {
      setPrices((await api.prices()).prices);
    } catch {
      // keep the last prices
    }
  }, []);

  useEffect(() => {
    if (phase !== "ready") return;
    void refreshPrices();
    void refreshPublic();
    const s = setInterval(() => {
      if (!document.hidden) void syncNow().catch(() => {});
    }, SYNC_MS);
    const p = setInterval(() => {
      if (!document.hidden) {
        void refreshPrices();
        void refreshPublic();
      }
    }, PRICE_MS);
    preloadProver("transfer");
    preloadProver("withdraw");
    return () => {
      clearInterval(s);
      clearInterval(p);
    };
  }, [phase, refreshPrices, refreshPublic, syncNow]);

  /* ─── connect ────────────────────────────────────────────────────── */

  const reset = useCallback(() => {
    setPhase("idle");
    setAddress(null);
    setKeys(null);
    setView(null);
    setPublicBalances({});
    setTx(null);
    setWrongChain(false);
    signatureRef.current = null;
    lastTxBlockRef.current = null;
    mirrorRef.current = new Mirror();
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const eth = W.injectedWallet();
    if (!eth) {
      setError("No wallet found in this browser. Install MetaMask or Rabby, then try again.");
      return;
    }
    ethRef.current = eth;
    try {
      setPhase("connecting");
      const addr = await W.connectWallet(eth);
      await W.ensureMonadTestnet(eth);
      const cfg = config ?? (await api.config());
      setConfig(cfg);
      setAddress(addr);
      void refreshPublic(addr, cfg);

      // the key index and viewing epoch this address registered with
      const reg = await W.registrationOf(cfg.pool, addr);
      setPhase("signing");
      const keyIndex = reg.registered ? reg.keyIndex : 0;
      const signature = await W.personalSign(eth, addr, keyMessage(cfg.keyNetwork, keyIndex));
      signatureRef.current = signature;
      const k = deriveKeysFromSignature(addr, signature, {
        network: cfg.keyNetwork,
        keyIndex,
        viewingEpoch: reg.registered ? reg.viewingEpoch : 0,
      });
      setKeys(k);

      if (!reg.registered) {
        setPhase("unregistered");
        return;
      }
      // login check: never act on an identity the chain does not have
      if (k.userCommitment !== reg.userCommitment) {
        reset();
        setError("This wallet signed differently from when it registered (a smart-contract or MPC wallet?). Menoid needs a wallet that signs the same way every time.");
        return;
      }
      setPhase("syncing");
      await syncNow(k);
      setPhase("ready");
    } catch (e) {
      reset();
      setError(friendlyError(e));
    }
  }, [config, refreshPublic, reset, syncNow]);

  // wallet switched account or chain: start over / ask to switch back
  useEffect(() => {
    const eth = ethRef.current;
    if (!eth?.on || !address) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts?.length || ethers.getAddress(accounts[0]) !== address) reset();
    };
    const onChain = (...args: unknown[]) => setWrongChain(Number(args[0] as string) !== W.MONAD_TESTNET.chainId);
    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [address, reset]);

  const switchChain = useCallback(async () => {
    if (!ethRef.current) return;
    try {
      await W.ensureMonadTestnet(ethRef.current);
      setWrongChain(false);
    } catch (e) {
      setError(friendlyError(e));
    }
  }, []);

  /* ─── transaction plumbing ───────────────────────────────────────── */

  const step = (patch: Partial<TxState>) => setTx((t) => (t ? { ...t, ...patch } : t));
  const begin = (kind: TxKind, title: string, steps: string[], message: string) =>
    setTx({ kind, title, steps, step: 0, status: "running", message });
  const fail = (e: unknown) => setTx((t) => (t ? { ...t, status: "error", error: friendlyError(e) } : t));

  const relayer = (): Recipient => {
    const r = config?.relayer;
    if (!r || "error" in r) throw new Error("The relayer is unavailable right now. Try again in a minute.");
    return { address: r.address, userCommitment: BigInt(r.userCommitment), viewingPublicKey: r.viewingPublicKey };
  };
  const feeFor = (token: TokenConfig) => ethers.parseUnits(config!.relayerFees[token.address] ?? "0", token.decimals);

  async function sendOwnTx(data: { to: string; data: string; value?: bigint }) {
    const eth = ethRef.current!;
    const hash = await W.sendFromWallet(eth, address!, data, config?.gasBufferPct ?? 110);
    step({ txHash: hash });
    const receipt = await W.waitForReceipt(hash);
    lastTxBlockRef.current = receipt.blockNumber;
    void api.notify(hash).catch(() => {});
    return receipt;
  }

  /* ─── register ───────────────────────────────────────────────────── */

  const register = useCallback(async () => {
    const k = keysRef.current;
    if (!k || !config || !address || !ethRef.current) return;
    begin("register", "Opening your private account", ["Check signature", "Register", "Ready"], "Sign the same message once more…");
    try {
      // a wallet must sign deterministically, or the keys could never be found again
      const again = await W.personalSign(ethRef.current, address, keyMessage(config.keyNetwork, k.keyIndex));
      if (again.toLowerCase() !== signatureRef.current?.toLowerCase()) {
        throw new Error("This wallet gives a different signature each time (smart-contract, passkey or MPC wallet). Private mode needs one that signs the same way every time.");
      }
      step({ step: 1, message: "Confirm the registration in your wallet…" });
      await sendOwnTx({ to: config.pool, data: W.poolInterface.encodeFunctionData("register", [k.userCommitmentBytes32, k.viewing.ivkPub]) });
      step({ step: 2, message: "Syncing your private balance…" });
      await syncNow(k);
      setPhase("ready");
      step({ status: "success", message: "Your private account is open.", result: "You can now mask tokens and receive private payments." });
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, address, syncNow]);

  /* ─── mask (deposit) ─────────────────────────────────────────────── */

  const mask = useCallback(async (token: TokenConfig, amount: bigint, to?: string) => {
    const k = keysRef.current;
    if (!k || !config || !address) return;
    const amountLabel = `${formatAmount(amount, token.decimals)} ${token.symbol}`;
    const needsApproval = !token.native && (await W.allowance(token.address, address, config.pool).catch(() => 0n)) < amount;
    begin("mask", `Masking ${amountLabel}`, needsApproval ? ["Approve", "Mask", "Hidden"] : ["Confirm", "Mask", "Hidden"], "Preparing your private note…");
    try {
      let recipient: Recipient = { address, userCommitment: k.userCommitment, viewingPublicKey: k.viewing.ivkPub };
      if (to && ethers.getAddress(to) !== address) {
        const reg = await W.registrationOf(config.pool, to);
        if (!reg.registered) throw new Error("That address has not registered with Menoid, so it cannot receive a masked balance.");
        recipient = { address: reg.address, userCommitment: reg.userCommitment, viewingPublicKey: reg.viewingPublicKey };
      }
      const built = buildDeposit({ token: token.address, amount, recipient });

      if (token.native) {
        step({ message: "Confirm in your wallet…" });
        await W.waitForReserveWindow(lastTxBlockRef.current, config.reserveDelayBlocks, () =>
          step({ message: "Waiting a few blocks (Monad's reserve rule)…" })
        );
        step({ step: 1, message: "Hiding your MON in the pool…" });
        await sendOwnTx({ to: config.pool, data: W.poolInterface.encodeFunctionData("depositNative", [built.npk, built.encryptedNote]), value: amount });
      } else {
        if (needsApproval) {
          step({ message: `Allow the pool to take ${amountLabel}…` });
          await sendOwnTx({ to: token.address, data: W.erc20Interface.encodeFunctionData("approve", [config.pool, amount]) });
        }
        step({ step: 1, message: "Confirm the mask in your wallet…", txHash: undefined });
        await sendOwnTx({ to: config.pool, data: W.poolInterface.encodeFunctionData("deposit", [token.address, amount, built.npk, built.encryptedNote]) });
      }
      step({ step: 2, message: "Syncing…" });
      await syncNow(k);
      void refreshPublic();
      step({
        status: "success",
        message: "Hidden.",
        result: recipient.address === address ? `${amountLabel} is now in your private balance.` : `${amountLabel} is now in ${W.shortAddress(recipient.address)}'s private balance.`,
      });
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, address, syncNow, refreshPublic]);

  /* ─── private spends: build + prove here, relay there ────────────── */

  async function freshView(k: PrivateKeys) {
    const v = await syncNow(k);
    if (!v) throw new Error("Could not sync your private balance");
    return v;
  }

  const send = useCallback(async (token: TokenConfig, amount: bigint, to: string) => {
    const k = keysRef.current;
    if (!k || !config) return;
    const amountLabel = `${formatAmount(amount, token.decimals)} ${token.symbol}`;
    begin("send", `Sending ${amountLabel}`, ["Prove", "Relay", "Delivered"], "Checking the recipient…");
    try {
      const reg = await W.registrationOf(config.pool, to);
      step({ message: "Forging the zero-knowledge proof…" });
      const v = await freshView(k);
      const fee = feeFor(token);
      const notes = pickNotes(v.unspent, token.address, amount + fee);
      const common = { chainId: config.chainId, pool: config.pool, mirror: mirrorRef.current, sender: k, notes, relayer: relayer(), fee, prove: proveInBrowser };
      let result;
      if (reg.registered) {
        const built = await buildTransfer({ ...common, token: token.address, amount, recipient: { address: reg.address, userCommitment: reg.userCommitment, viewingPublicKey: reg.viewingPublicKey } });
        step({ step: 1, message: "The relayer is carrying it across…" });
        result = await api.relay("transfer", [built.call]);
      } else {
        // not registered: it arrives in their public wallet
        const built = await buildWithdraw({ ...common, token: token.address, amount, to: reg.address, unwrapNative: Boolean(token.native) });
        step({ step: 1, message: "The relayer is delivering it to their wallet…" });
        result = await api.relay("withdraw", [built.call]);
      }
      step({ step: 2, txHash: result.txHash, message: "Syncing…" });
      await syncNow(k);
      step({
        status: "success",
        message: "Delivered.",
        result: reg.registered
          ? `${amountLabel} sent privately to ${W.shortAddress(reg.address)}.`
          : `${amountLabel} arrived in ${W.shortAddress(reg.address)}'s public wallet (they are not registered).`,
      });
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, syncNow]);

  const unmask = useCallback(async (token: TokenConfig, amount: bigint, to: string) => {
    const k = keysRef.current;
    if (!k || !config) return;
    const amountLabel = `${formatAmount(amount, token.decimals)} ${token.symbol}`;
    begin("unmask", `Unmasking ${amountLabel}`, ["Prove", "Relay", "Revealed"], "Forging the zero-knowledge proof…");
    try {
      const v = await freshView(k);
      const fee = feeFor(token);
      const notes = pickNotes(v.unspent, token.address, amount + fee);
      const built = await buildWithdraw({
        chainId: config.chainId,
        pool: config.pool,
        mirror: mirrorRef.current,
        sender: k,
        notes,
        relayer: relayer(),
        fee,
        prove: proveInBrowser,
        token: token.address,
        amount,
        to,
        unwrapNative: Boolean(token.native),
      });
      step({ step: 1, message: "The relayer is bringing it back to the open…" });
      const result = await api.relay("withdraw", [built.call]);
      step({ step: 2, txHash: result.txHash, message: "Syncing…" });
      await syncNow(k);
      void refreshPublic();
      step({ status: "success", message: "Revealed.", result: `${amountLabel} is back in ${W.shortAddress(to)}.` });
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, syncNow, refreshPublic]);

  const swap = useCallback(async (tokenIn: TokenConfig, amountIn: bigint, tokenOut: TokenConfig, slippageBps: number) => {
    const k = keysRef.current;
    if (!k || !config) return;
    const amountLabel = `${formatAmount(amountIn, tokenIn.decimals)} ${tokenIn.symbol}`;
    begin("swap", `Swapping ${amountLabel} → ${tokenOut.symbol}`, ["Quote", "Prove", "Trade", "Done"], "Finding the best route…");
    try {
      const quote = await api.quote(tokenIn.address, tokenOut.address, amountIn);
      const minAmountOut = (BigInt(quote.amountOut) * BigInt(10_000 - slippageBps)) / 10_000n;
      step({ step: 1, message: "Forging the zero-knowledge proof…" });
      const v = await freshView(k);
      const fee = feeFor(tokenIn);
      const notes = pickNotes(v.unspent, tokenIn.address, amountIn + fee);
      const built = await buildSwap({
        chainId: config.chainId,
        pool: config.pool,
        mirror: mirrorRef.current,
        sender: k,
        notes,
        relayer: relayer(),
        fee,
        prove: proveInBrowser,
        tokenIn: tokenIn.address,
        amountIn,
        tokenOut: tokenOut.address,
        minAmountOut,
        adapter: quote.adapter,
        routeData: quote.path,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 900),
      });
      step({ step: 2, message: "The pool is trading on Uniswap V3…" });
      const result = await api.relay("swap", [built.call]);
      step({ step: 3, txHash: result.txHash, message: "Syncing…" });
      await syncNow(k);
      const out = result.swap ? `${formatAmount(BigInt(result.swap.amountOut), tokenOut.decimals)} ${tokenOut.symbol}` : tokenOut.symbol;
      step({ status: "success", message: "Swapped.", result: `${amountLabel} became ${out}, privately.` });
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, syncNow]);

  /** Test tokens anyone can mint, for trying the app. */
  const mintTestTokens = useCallback(async (token: TokenConfig) => {
    if (!address || !token.faucet) return;
    const amount = ethers.parseUnits(token.stable ? "1000" : "1000", token.decimals);
    begin("mask", `Minting test ${token.symbol}`, ["Confirm", "Mint", "Done"], "Confirm in your wallet…");
    try {
      step({ step: 1 });
      await sendOwnTx({ to: token.address, data: W.erc20Interface.encodeFunctionData("mint", [address, amount]) });
      await refreshPublic();
      step({ step: 2, status: "success", message: "Minted.", result: `1,000 test ${token.symbol} added to your wallet.` });
    } catch (e) {
      fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshPublic]);

  return {
    phase,
    error,
    setError,
    config,
    address,
    keys,
    view,
    prices,
    publicBalances,
    wrongChain,
    syncing,
    tx,
    closeTx: () => setTx(null),
    connect,
    disconnect: reset,
    switchChain,
    register,
    mask,
    send,
    unmask,
    swap,
    mintTestTokens,
    refresh: () => syncNow(),
    feeFor: (token: TokenConfig) => (config ? feeFor(token) : 0n),
  };
}

export type Menoid = ReturnType<typeof useMenoid>;
