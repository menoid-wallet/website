"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

import { api, ApiError, type AppConfig, type FeeQuote, type RelayResult, type TokenConfig } from "@/lib/v1m/api";
import { decodeViewingKey, deriveKeysFromSignature, encodeViewingKey, fullViewingKey, keyMessage, type PrivateKeys } from "@/lib/v1m/protocol";
import { Mirror, scan, type WalletView } from "@/lib/v1m/mirror";
import { buildDeposit, buildSwap, buildTransfer, buildWithdraw, pickNotes, planBatches, type Recipient } from "@/lib/v1m/build";
import { preloadProver, proveInBrowser } from "@/lib/v1m/prover";
import * as W from "@/lib/v1m/wallet";
import { formatAmount } from "@/lib/v1m/format";

/**
 * The private app's session: connect → sign once → (register) → act.
 *
 * The one signature is kept in memory for as long as this tab is open — it is
 * the spending secret, so it is never written to storage. Registering is then
 * a single transaction; nothing asks to sign the message again.
 */

export type Phase = "idle" | "connecting" | "signing" | "syncing" | "ready";

export type TxKind = "register" | "mask" | "send" | "swap" | "unmask" | "faucet";
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

export type InspectResult = { address: string; registered: boolean; view: WalletView };

const SYNC_MS = 8_000;
const PRICE_MS = 30_000;
export const LAST_WALLET_KEY = "menoid:lastWallet";

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

const feeTooLow = (e: unknown): FeeQuote | null =>
  e instanceof ApiError && e.status === 409 && e.body?.code === "fee_too_low" ? (e.body.required as FeeQuote) : null;

export function useMenoid() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [keys, setKeys] = useState<PrivateKeys | null>(null);
  const [view, setView] = useState<WalletView | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [publicBalances, setPublicBalances] = useState<Record<string, bigint>>({});
  const [wrongChain, setWrongChain] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [indexedBlock, setIndexedBlock] = useState<number | null>(null);
  const [tx, setTx] = useState<TxState | null>(null);

  const ethRef = useRef<W.Eip1193 | null>(null);
  const mirrorRef = useRef<Mirror>(new Mirror());
  const lastTxBlockRef = useRef<number | null>(null);
  const keysRef = useRef<PrivateKeys | null>(null);
  const applyKeys = (k: PrivateKeys | null) => {
    keysRef.current = k;
    setKeys(k);
  };

  // the config and prices are public: load them right away (the panels need the
  // config before anyone connects, so keep trying until the relayer answers)
  useEffect(() => {
    let live = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const load = () =>
      api
        .config()
        .then((c) => live && setConfig(c))
        .catch(() => {
          if (live) retry = setTimeout(load, 4000);
        });
    load();
    api.prices().then((p) => live && setPrices(p.prices)).catch(() => {});
    return () => {
      live = false;
      clearTimeout(retry);
    };
  }, []);

  /* ─── sync ───────────────────────────────────────────────────────── */

  const syncNow = useCallback(async (k: PrivateKeys | null = keysRef.current) => {
    if (!k) return null;
    setSyncing(true);
    try {
      await mirrorRef.current.sync((since) => api.sync(since));
      const v = scan(mirrorRef.current, k);
      setView(v);
      setIndexedBlock(mirrorRef.current.indexedBlock);
      return v;
    } finally {
      setSyncing(false);
    }
  }, []);

  /** Sync until the backend has indexed `block` (where our transaction landed). */
  const syncUntil = useCallback(async (block: number, k: PrivateKeys | null = keysRef.current) => {
    for (let i = 0; i < 30; i++) {
      const v = await syncNow(k);
      if (mirrorRef.current.indexedBlock >= block) return v;
      await new Promise((r) => setTimeout(r, 700));
    }
    return syncNow(k);
  }, [syncNow]);

  const refreshPublic = useCallback(async (addr: string | null = address, cfg: AppConfig | null = config) => {
    if (!addr || !cfg) return;
    const entries = await Promise.all(cfg.tokens.map(async (t) => [t.address, await W.publicBalance(t, addr).catch(() => 0n)] as const));
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
    const kick = setTimeout(() => {
      void refreshPrices();
      void refreshPublic();
    }, 0);
    const s = setInterval(() => {
      if (!document.hidden && registered) void syncNow().catch(() => {});
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
      clearTimeout(kick);
      clearInterval(s);
      clearInterval(p);
    };
  }, [phase, registered, refreshPrices, refreshPublic, syncNow]);

  /* ─── connect: one signature ─────────────────────────────────────── */

  const reset = useCallback(() => {
    setPhase("idle");
    setRegistered(false);
    setAddress(null);
    applyKeys(null);
    setView(null);
    setPublicBalances({});
    setTx(null);
    setWrongChain(false);
    lastTxBlockRef.current = null;
    mirrorRef.current = new Mirror();
  }, []);

  const connect = useCallback(async (wallet: W.WalletOption) => {
    setError(null);
    const eth = wallet.provider;
    ethRef.current = eth;
    try {
      localStorage.setItem(LAST_WALLET_KEY, wallet.id);
    } catch {
      // storage blocked: only the "last used" hint is lost
    }
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
      const message = keyMessage(cfg.keyNetwork, keyIndex);
      const signature = await W.personalSign(eth, addr, message);

      /* The keys must come back the same next time, so the wallet has to sign
         deterministically. A plain key-pair wallet does (RFC 6979) and its
         signature recovers to its address; a smart-contract or MPC wallet's
         does not — refuse those here instead of asking to sign twice. */
      if (ethers.verifyMessage(message, signature) !== addr) {
        throw new Error("This wallet signs in a way private mode cannot use (a smart-contract or MPC wallet). Connect a regular wallet such as MetaMask, Rabby or Phantom.");
      }
      const k = deriveKeysFromSignature(addr, signature, {
        network: cfg.keyNetwork,
        keyIndex,
        viewingEpoch: reg.registered ? reg.viewingEpoch : 0,
      });

      if (reg.registered) {
        // login check: never act on an identity the chain does not have
        if (k.userCommitment !== reg.userCommitment) {
          reset();
          setError("This wallet's keys do not match its Menoid registration. Was it registered with a different key index?");
          return;
        }
        applyKeys(k);
        setRegistered(true);
        setPhase("syncing");
        await syncNow(k);
      } else {
        applyKeys(k);
        setRegistered(false);
      }
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
  const begin = (kind: TxKind, title: string, steps: string[], message: string) => setTx({ kind, title, steps, step: 0, status: "running", message });
  const fail = (e: unknown) => {
    setTx((t) => (t ? { ...t, status: "error", error: friendlyError(e) } : t));
    return false;
  };

  const relayer = (): Recipient => {
    const r = config?.relayer;
    if (!r || "error" in r) throw new Error("The relayer is unavailable right now. Try again in a minute.");
    return { address: r.address, userCommitment: BigInt(r.userCommitment), viewingPublicKey: r.viewingPublicKey };
  };

  async function sendOwnTx(data: { to: string; data: string; value?: bigint }) {
    const eth = ethRef.current!;
    const hash = await W.sendFromWallet(eth, address!, data, config?.gasBufferPct ?? 110);
    step({ txHash: hash });
    const receipt = await W.waitForReceipt(hash);
    lastTxBlockRef.current = receipt.blockNumber;
    void api.notify(hash).catch(() => {});
    return receipt;
  }

  /* Build with a fee, relay; if the relayer says costs moved past the quote,
     build once more with its fresh fee. */
  async function relayWithFee(firstFee: bigint, buildAndRelay: (feePerCall: bigint) => Promise<RelayResult>) {
    try {
      return await buildAndRelay(firstFee);
    } catch (e) {
      const required = feeTooLow(e);
      if (!required) throw e;
      step({ message: "Network fees moved — re-forging the proof with a fresh fee…" });
      return buildAndRelay(BigInt(required.feePerCall));
    }
  }

  /* ─── register: one transaction ──────────────────────────────────── */

  const register = useCallback(async () => {
    const k = keysRef.current;
    if (!k || !config || !address || !ethRef.current) return false;
    begin("register", "Opening your private account", ["Register", "Ready"], "Confirm the registration in your wallet…");
    try {
      await sendOwnTx({ to: config.pool, data: W.poolInterface.encodeFunctionData("register", [k.userCommitmentBytes32, k.viewing.ivkPub]) });
      step({ step: 1, message: "Syncing your private balance…" });
      await syncUntil(lastTxBlockRef.current ?? 0, k);
      setRegistered(true);
      step({ status: "success", message: "Your private account is open.", result: "You can now mask tokens and receive private payments." });
      return true;
    } catch (e) {
      return fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, address, syncUntil]);

  /* ─── mask (deposit): the user's own transaction ─────────────────── */

  const mask = useCallback(async (token: TokenConfig, amount: bigint, to?: string) => {
    const k = keysRef.current;
    if (!k || !config || !address) return false;
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
        await W.waitForReserveWindow(lastTxBlockRef.current, config.reserveDelayBlocks, () => step({ message: "Waiting a few blocks (Monad's reserve rule)…" }));
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
      await syncUntil(lastTxBlockRef.current ?? 0, k);
      void refreshPublic();
      step({
        status: "success",
        message: "Hidden.",
        result: recipient.address === address ? `${amountLabel} is now in your private balance.` : `${amountLabel} is now in ${W.shortAddress(recipient.address)}'s private balance.`,
      });
      return true;
    } catch (e) {
      return fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, address, syncUntil, refreshPublic]);

  /* ─── private spends: build + prove here, relay there ────────────── */

  async function freshView(k: PrivateKeys) {
    const v = await syncNow(k);
    if (!v) throw new Error("Could not sync your private balance");
    return v;
  }

  /** Withdraw-shaped and transfer-shaped spends, split into ≤4-note proofs. */
  async function spendInBatches(
    k: PrivateKeys,
    kind: "transfer" | "withdraw",
    token: TokenConfig,
    amount: bigint,
    target: { recipient?: Recipient; to?: string }
  ) {
    const v = await freshView(k);
    const firstQuote = await api.fee(kind, token.address, 1);
    let calls = planBatches(v.unspent, token.address, amount, BigInt(firstQuote.feePerCall)).length;
    const quote = calls > 1 ? await api.fee(kind, token.address, calls) : firstQuote;

    return relayWithFee(BigInt(quote.feePerCall), async (feePerCall) => {
      const batches = planBatches(v.unspent, token.address, amount, feePerCall);
      calls = batches.length;
      step({ step: 0, message: calls > 1 ? `Forging ${calls} zero-knowledge proofs…` : "Forging the zero-knowledge proof…" });
      const common = { chainId: config!.chainId, pool: config!.pool, mirror: mirrorRef.current, sender: k, relayer: relayer(), fee: feePerCall, prove: proveInBrowser };
      const callsBuilt = [];
      for (const batch of batches) {
        const built =
          kind === "transfer"
            ? await buildTransfer({ ...common, notes: batch.notes, token: token.address, amount: batch.amount, recipient: target.recipient! })
            : await buildWithdraw({ ...common, notes: batch.notes, token: token.address, amount: batch.amount, to: target.to!, unwrapNative: Boolean(token.native) });
        callsBuilt.push(built.call);
      }
      step({ step: 1, message: kind === "transfer" ? "The relayer is carrying it across…" : "The relayer is delivering it…" });
      return api.relay(kind, callsBuilt);
    });
  }

  const send = useCallback(async (token: TokenConfig, amount: bigint, to: string) => {
    const k = keysRef.current;
    if (!k || !config) return false;
    const amountLabel = `${formatAmount(amount, token.decimals)} ${token.symbol}`;
    begin("send", `Sending ${amountLabel}`, ["Prove", "Relay", "Delivered"], "Checking the recipient…");
    try {
      const reg = await W.registrationOf(config.pool, to);
      const result = reg.registered
        ? await spendInBatches(k, "transfer", token, amount, { recipient: { address: reg.address, userCommitment: reg.userCommitment, viewingPublicKey: reg.viewingPublicKey } })
        : await spendInBatches(k, "withdraw", token, amount, { to: reg.address }); // not registered: their public wallet
      step({ step: 2, txHash: result.txHash, message: "Syncing…" });
      await syncUntil(result.blockNumber, k);
      step({
        status: "success",
        message: "Delivered.",
        result: reg.registered
          ? `${amountLabel} sent privately to ${W.shortAddress(reg.address)}.`
          : `${amountLabel} arrived in ${W.shortAddress(reg.address)}'s public wallet (they are not registered).`,
      });
      return true;
    } catch (e) {
      return fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, syncNow, syncUntil]);

  const unmask = useCallback(async (token: TokenConfig, amount: bigint, to: string) => {
    const k = keysRef.current;
    if (!k || !config) return false;
    const amountLabel = `${formatAmount(amount, token.decimals)} ${token.symbol}`;
    begin("unmask", `Unmasking ${amountLabel}`, ["Prove", "Relay", "Revealed"], "Forging the zero-knowledge proof…");
    try {
      const result = await spendInBatches(k, "withdraw", token, amount, { to });
      step({ step: 2, txHash: result.txHash, message: "Syncing…" });
      await syncUntil(result.blockNumber, k);
      void refreshPublic();
      step({ status: "success", message: "Revealed.", result: `${amountLabel} is back in ${W.shortAddress(to)}.` });
      return true;
    } catch (e) {
      return fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, syncNow, syncUntil, refreshPublic]);

  const swap = useCallback(async (tokenIn: TokenConfig, amountIn: bigint, tokenOut: TokenConfig, slippageBps: number) => {
    const k = keysRef.current;
    if (!k || !config) return false;
    const amountLabel = `${formatAmount(amountIn, tokenIn.decimals)} ${tokenIn.symbol}`;
    begin("swap", `Swapping ${amountLabel} → ${tokenOut.symbol}`, ["Quote", "Prove", "Trade", "Done"], "Finding the best route…");
    try {
      const quote = await api.quote(tokenIn.address, tokenOut.address, amountIn);
      const minAmountOut = (BigInt(quote.amountOut) * BigInt(10_000 - slippageBps)) / 10_000n;
      const feeQuote = await api.fee("swap", tokenIn.address, 1, quote.fees.length);
      const v = await freshView(k);
      const result = await relayWithFee(BigInt(feeQuote.feePerCall), async (fee) => {
        step({ step: 1, message: "Forging the zero-knowledge proof…" });
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
        return api.relay("swap", [built.call]);
      });
      step({ step: 3, txHash: result.txHash, message: "Syncing…" });
      await syncUntil(result.blockNumber, k);
      const out = result.swap ? `${formatAmount(BigInt(result.swap.amountOut), tokenOut.decimals)} ${tokenOut.symbol}` : tokenOut.symbol;
      step({ status: "success", message: "Swapped.", result: `${amountLabel} became ${out}, privately.` });
      return true;
    } catch (e) {
      return fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, syncNow, syncUntil]);

  /** Test tokens anyone can mint, for trying the app. */
  const mintTestTokens = useCallback(async (token: TokenConfig) => {
    if (!address || !token.faucet) return false;
    const amount = ethers.parseUnits("1000", token.decimals);
    begin("faucet", `Minting test ${token.symbol}`, ["Confirm", "Mint", "Done"], "Confirm in your wallet…");
    try {
      step({ step: 1 });
      await sendOwnTx({ to: token.address, data: W.erc20Interface.encodeFunctionData("mint", [address, amount]) });
      await refreshPublic();
      step({ step: 2, status: "success", message: "Minted.", result: `1,000 test ${token.symbol} added to your wallet.` });
      return true;
    } catch (e) {
      return fail(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, refreshPublic]);

  /** Someone shared a full viewing key: decrypt their activity here. Read-only. */
  const inspectViewingKey = useCallback(async (encoded: string): Promise<InspectResult> => {
    const cfg = config ?? (await api.config());
    const key = decodeViewingKey(encoded);
    if (key.network !== cfg.keyNetwork) throw new Error(`This viewing key is for ${key.network}; this app is on ${cfg.keyNetwork}.`);
    const reg = await W.registrationOf(cfg.pool, key.address);
    const sameIdentity = reg.registered && reg.userCommitment === key.userCommitment;
    await mirrorRef.current.sync((since) => api.sync(since));
    const v = scan(mirrorRef.current, { ...key, viewingEpoch: sameIdentity ? reg.viewingEpoch : 0 });
    return { address: key.address, registered: sameIdentity, view: v };
  }, [config]);

  return {
    phase,
    registered,
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
    inspectViewingKey,
    refresh: () => syncNow(),
    indexedBlock,
    /** A full viewing key: shows everything, spends nothing. */
    viewingKey: () => (keys ? encodeViewingKey(fullViewingKey(keys)) : null),
  };
}

export type Menoid = ReturnType<typeof useMenoid>;
