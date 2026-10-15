"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ethers } from "ethers";

import { ApiError, chainApi, listChains, type AppConfig, type ChainApi, type ChainInfo, type FeeQuote, type RelayResult, type TokenConfig, type TokenLookup } from "@/lib/v1m/api";
import { decodeViewingKey, deriveKeysFromSignature, encodeViewingKey, fullViewingKey, keyMessage, withViewingEpoch, type PrivateKeys } from "@/lib/v1m/protocol";
import { Mirror, scan, type WalletView } from "@/lib/v1m/mirror";
import { buildDeposit, buildSwap, buildTransfer, buildWithdraw, pickNotes, planBatches, type Recipient } from "@/lib/v1m/build";
import { preloadProver, proveInBrowser, type ProvingKeys } from "@/lib/v1m/prover";
import * as W from "@/lib/v1m/wallet";
import { formatAmount } from "@/lib/v1m/format";

/**
 * The private app's session: pick a chain → connect → sign once → (register)
 * → act.
 *
 * The one signature is kept in memory for as long as this tab is open — it is
 * the spending secret, so it is never written to storage. Registering is then
 * a single transaction; nothing asks to sign the message again.
 *
 * Chains: the same keys work on every chain of a network (the key message has
 * no chain id), but each pool has its own registrations and notes. Switching
 * chain therefore keeps the keys when it can, re-checks the registration on
 * the new pool, and syncs a fresh mirror of it.
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
export const CHAIN_KEY = "menoid:chain";
const CUSTOM_TOKENS_KEY = (chainId: string) => `menoid:tokens:${chainId}`;

// tokens the user added by address, per chain (this browser only)
function loadCustomTokens(): Record<string, TokenConfig[]> {
  if (typeof window === "undefined") return {};
  const out: Record<string, TokenConfig[]> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("menoid:tokens:")) continue;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(list)) out[key.slice("menoid:tokens:".length)] = list;
    }
  } catch {
    // storage blocked or garbled: no added tokens
  }
  return out;
}
function saveCustomTokens(chainId: string, list: TokenConfig[]) {
  try {
    localStorage.setItem(CUSTOM_TOKENS_KEY(chainId), JSON.stringify(list));
  } catch {
    // storage blocked: the token lasts this visit
  }
}

const rejected = (e: unknown) => {
  const err = e as { code?: number | string; message?: string; info?: { error?: { code?: number } } };
  return err?.code === 4001 || err?.code === "ACTION_REJECTED" || err?.info?.error?.code === 4001 || /user (rejected|denied)/i.test(err?.message || "");
};

// the node's own words: ethers reports a failed gas estimate as "missing revert data"
const nodeMessage = (e: unknown) => (e as { info?: { error?: { message?: string } } })?.info?.error?.message ?? "";

export function friendlyError(e: unknown, nativeSymbol = "gas", reserve = "10"): string {
  if (rejected(e)) return "You cancelled it in your wallet.";
  if (e instanceof ApiError) return e.message;
  const err = e as { shortMessage?: string; reason?: string; message?: string };
  let text = err?.shortMessage || err?.reason || err?.message || String(e);
  if (/insufficient funds/i.test(text)) return `Not enough ${nativeSymbol} in your wallet to pay for gas.`;
  if (/reserve balance/i.test(`${nodeMessage(e)} ${text}`)) {
    return `Monad refused it: a wallet sending ${nativeSymbol} must keep ${reserve} ${nativeSymbol}, unless it is the wallet's only transaction in 3 blocks (never for a smart account). Wait a few seconds and try again, or mask less.`;
  }
  if (text === "missing revert data" && nodeMessage(e)) text = nodeMessage(e);
  return text.length > 220 ? text.slice(0, 220) + "…" : text;
}

// proofs for a chain use ITS setup's proving keys (the ceremony's on mainnet)
const proverFor = (keys: ProvingKeys | undefined) => (circuit: "transfer" | "withdraw", input: Record<string, unknown>) =>
  proveInBrowser(circuit, input, keys ?? "testnet");

// Monad: an account sending its coin must keep a reserve of it (wallet.ts)
const hasReserve = (cfg: AppConfig) => Number(cfg.reserveBalance ?? 0) > 0;

const feeTooLow = (e: unknown): FeeQuote | null =>
  e instanceof ApiError && e.status === 409 && e.body?.code === "fee_too_low" ? (e.body.required as FeeQuote) : null;

const storedChain = () => {
  try {
    return localStorage.getItem(CHAIN_KEY);
  } catch {
    return null;
  }
};

export function useMenoid() {
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [chainId, setChainId] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, AppConfig>>({});
  const [pricesByChain, setPricesByChain] = useState<Record<string, Record<string, number>>>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [keys, setKeys] = useState<PrivateKeys | null>(null);
  const [view, setView] = useState<WalletView | null>(null);
  const [publicBalances, setPublicBalances] = useState<Record<string, bigint>>({});
  const [smartAccount, setSmartAccount] = useState(false); // EIP-7702 delegated, on a chain with a reserve rule
  const [wrongChain, setWrongChain] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [indexedBlock, setIndexedBlock] = useState<number | null>(null);
  const [tx, setTx] = useState<TxState | null>(null);
  const [customTokens, setCustomTokens] = useState<Record<string, TokenConfig[]>>(loadCustomTokens);

  const config = chainId ? configs[chainId] ?? null : null;
  const api = useMemo(() => (chainId ? chainApi(chainId) : null), [chainId]);

  /* The chain's own tokens (the pool's list) and the ones the user added by
     address. A listed token is accepted and priced; an added one says so. */
  const tokens = useMemo<TokenConfig[]>(() => {
    const listed = (config?.tokens ?? []).map((t) => ({ ...t, enabled: t.enabled ?? true, relayable: t.relayable ?? true }));
    const added = (chainId ? customTokens[chainId] ?? [] : []).filter((c) => !listed.some((l) => l.address.toLowerCase() === c.address.toLowerCase()));
    return [...listed, ...added];
  }, [config, customTokens, chainId]);
  const prices = useMemo(() => {
    const base = chainId ? pricesByChain[chainId] ?? {} : {};
    const added = Object.fromEntries(tokens.filter((t) => t.custom).map((t) => [t.address, base[t.address] ?? t.priceUsd ?? 0]));
    return { ...added, ...base };
  }, [chainId, pricesByChain, tokens]);

  const ethRef = useRef<W.Eip1193 | null>(null);
  const mirrorRef = useRef<Mirror>(new Mirror());
  const lastTxBlockRef = useRef<number | null>(null);
  const keysRef = useRef<PrivateKeys | null>(null);
  const tokensRef = useRef<TokenConfig[]>([]);
  // the chain async work is for: a switch makes older work's results stale
  const chainRef = useRef<{ id: string | null; config: AppConfig | null; api: ChainApi | null; seq: number }>({ id: null, config: null, api: null, seq: 0 });
  const applyKeys = (k: PrivateKeys | null) => {
    keysRef.current = k;
    setKeys(k);
  };

  /* ─── chains: every chain's config up front, so a switch is instant ── */

  useEffect(() => {
    let live = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      try {
        const { default: fallback, chains: list } = await listChains();
        const loaded = await Promise.all(list.map((c) => chainApi(c.id).config().then((cfg) => [c.id, cfg] as const)));
        if (!live) return;
        W.rememberChains(list);
        setChains(list);
        setConfigs(Object.fromEntries(loaded));
        const saved = storedChain();
        setChainId((current) => current ?? (list.some((c) => c.id === saved) ? saved! : fallback));
        for (const c of list) {
          chainApi(c.id)
            .prices()
            .then((p) => live && setPricesByChain((all) => ({ ...all, [c.id]: p.prices })))
            .catch(() => {});
        }
      } catch {
        // the relayer is down or still starting: keep trying
        if (live) retry = setTimeout(load, 4000);
      }
    };
    void load();
    return () => {
      live = false;
      clearTimeout(retry);
    };
  }, []);

  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  // keep the refs on the chain the UI shows
  useEffect(() => {
    if (chainRef.current.id !== chainId) chainRef.current = { id: chainId, config, api, seq: chainRef.current.seq + 1 };
    else chainRef.current = { ...chainRef.current, config, api };
  }, [chainId, config, api]);

  /* ─── sync ───────────────────────────────────────────────────────── */

  const syncNow = useCallback(async (k: PrivateKeys | null = keysRef.current) => {
    const { api: chain, seq } = chainRef.current;
    if (!k || !chain) return null;
    const mirror = mirrorRef.current;
    setSyncing(true);
    try {
      await mirror.sync((since) => chain.sync(since));
      if (seq !== chainRef.current.seq) return null; // the user switched chain meanwhile
      const v = scan(mirror, k);
      setView(v);
      setIndexedBlock(mirror.indexedBlock);
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

  const refreshPublic = useCallback(async (addr: string | null = address, cfg: AppConfig | null = chainRef.current.config) => {
    if (!addr || !cfg) return;
    // every token's balance in one call (Multicall3)
    const list = cfg.id === chainRef.current.id && tokensRef.current.length ? tokensRef.current : cfg.tokens;
    const [balances, smart] = await Promise.all([
      W.publicBalances(cfg, list, addr),
      // only Monad's reserve rule cares whether the wallet is a smart account
      hasReserve(cfg) ? W.isSmartAccount(cfg, addr).catch(() => false) : false,
    ]);
    if (cfg.id === chainRef.current.id) {
      setPublicBalances(balances);
      setSmartAccount(smart);
    }
  }, [address]);

  const refreshPrices = useCallback(async () => {
    const { id, api: chain } = chainRef.current;
    if (!id || !chain) return;
    try {
      const { prices: next } = await chain.prices();
      // added tokens are priced one by one (the backend's table only has the listed ones)
      const added = await Promise.all(
        tokensRef.current.filter((t) => t.custom).map(async (t) => [t.address, (await chain.token(t.address).catch(() => null))?.priceUsd ?? 0] as const)
      );
      setPricesByChain((all) => ({ ...all, [id]: { ...Object.fromEntries(added), ...next } }));
    } catch {
      // keep the last prices
    }
  }, []);

  /* ─── tokens by address ──────────────────────────────────────────── */

  /** What the backend knows about any token on this chain: accepted by the pool? priced? */
  const lookupToken = useCallback(async (address: string): Promise<TokenLookup> => {
    const chain = chainRef.current.api;
    if (!chain) throw new Error("Still loading — try again in a moment.");
    return chain.token(address);
  }, []);

  const addToken = useCallback((t: TokenLookup) => {
    const id = chainRef.current.id;
    if (!id) return;
    const entry: TokenConfig = {
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      decimals: t.decimals,
      logo: t.logo,
      custom: true,
      enabled: t.enabled,
      relayable: t.relayable,
      priceUsd: t.priceUsd,
    };
    setCustomTokens((all) => {
      const list = [...(all[id] ?? []).filter((x) => x.address.toLowerCase() !== t.address.toLowerCase()), entry];
      saveCustomTokens(id, list);
      return { ...all, [id]: list };
    });
    if (t.priceUsd > 0) setPricesByChain((all) => ({ ...all, [id]: { ...(all[id] ?? {}), [t.address]: all[id]?.[t.address] ?? t.priceUsd } }));
    setTimeout(() => void refreshPublic(), 0);
  }, [refreshPublic]);

  const removeToken = useCallback((address: string) => {
    const id = chainRef.current.id;
    if (!id) return;
    setCustomTokens((all) => {
      const list = (all[id] ?? []).filter((x) => x.address.toLowerCase() !== address.toLowerCase());
      saveCustomTokens(id, list);
      return { ...all, [id]: list };
    });
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
    const keys = chainRef.current.config?.provingKeys;
    preloadProver("transfer", keys);
    preloadProver("withdraw", keys);
    return () => {
      clearTimeout(kick);
      clearInterval(s);
      clearInterval(p);
    };
  }, [phase, registered, refreshPrices, refreshPublic, syncNow, chainId]);

  /* ─── connect: one signature ─────────────────────────────────────── */

  const reset = useCallback(() => {
    setPhase("idle");
    setRegistered(false);
    setAddress(null);
    applyKeys(null);
    setView(null);
    setPublicBalances({});
    setSmartAccount(false);
    setTx(null);
    setWrongChain(false);
    lastTxBlockRef.current = null;
    mirrorRef.current = new Mirror();
  }, []);

  /* The keys for `cfg`'s pool: the ones in memory when they fit its
     registration (same network, same key index), else one new signature.
     Never acts on keys the pool does not recognise. */
  async function keysFor(cfg: AppConfig, addr: string, eth: W.Eip1193, current: PrivateKeys | null) {
    const reg = await W.registrationOf(cfg, cfg.pool, addr);
    const keyIndex = reg.registered ? reg.keyIndex : 0;
    const viewingEpoch = reg.registered ? reg.viewingEpoch : 0;
    let k: PrivateKeys;
    if (current && current.address === addr && current.network === cfg.keyNetwork && current.keyIndex === keyIndex) {
      k = current.viewingEpoch === viewingEpoch ? current : withViewingEpoch(current, viewingEpoch);
    } else {
      setPhase("signing");
      const message = keyMessage(cfg.keyNetwork, keyIndex);
      const signature = await W.personalSign(eth, addr, message);

      /* The keys must come back the same next time, so the wallet has to sign
         deterministically. A plain key-pair wallet does (RFC 6979) and its
         signature recovers to its address; a smart-contract or MPC wallet's
         does not — refuse those here instead of asking to sign twice. */
      if (ethers.verifyMessage(message, signature) !== addr) {
        throw new Error("This wallet signs in a way private mode cannot use (a smart-contract or MPC wallet). Connect a regular wallet such as MetaMask, Rabby or Phantom.");
      }
      k = deriveKeysFromSignature(addr, signature, { network: cfg.keyNetwork, keyIndex, viewingEpoch });
    }
    // login check: never act on an identity the chain does not have
    if (reg.registered && k.userCommitment !== reg.userCommitment) {
      throw new Error(`This wallet's keys do not match its Menoid registration on ${cfg.name}. Was it registered with a different key index?`);
    }
    return { k, registered: reg.registered };
  }

  const connect = useCallback(async (wallet: W.WalletOption) => {
    const cfg = chainRef.current.config;
    if (!cfg) return;
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
      await W.ensureChain(eth, cfg);
      setAddress(addr);
      void refreshPublic(addr, cfg);

      const { k, registered: isRegistered } = await keysFor(cfg, addr, eth, null);
      applyKeys(k);
      setRegistered(isRegistered);
      if (isRegistered) {
        setPhase("syncing");
        await syncNow(k);
      }
      setPhase("ready");
    } catch (e) {
      reset();
      setError(friendlyError(e, cfg.nativeSymbol));
    }
  }, [refreshPublic, reset, syncNow]);

  /** Show another chain. Connected: the wallet follows, the keys are re-checked against that pool, and its notes synced. */
  const selectChain = useCallback(async (id: string) => {
    const cfg = configs[id];
    if (!cfg || id === chainRef.current.id) return;
    try {
      localStorage.setItem(CHAIN_KEY, id);
    } catch {
      // storage blocked: the choice lasts this visit
    }
    const seq = chainRef.current.seq + 1;
    chainRef.current = { id, config: cfg, api: chainApi(id), seq };
    setChainId(id);
    setError(null);
    setView(null);
    setPublicBalances({});
    setSmartAccount(false);
    setIndexedBlock(null);
    setWrongChain(false);
    mirrorRef.current = new Mirror();
    lastTxBlockRef.current = null;

    const eth = ethRef.current;
    if (!eth || !address || phase === "idle") return;
    const stale = () => seq !== chainRef.current.seq;
    try {
      setPhase("connecting");
      try {
        await W.ensureChain(eth, cfg);
      } catch (e) {
        if (rejected(e)) setWrongChain(true); // private actions still work; the banner offers the switch again
        else throw e;
      }
      if (stale()) return;
      const { k, registered: isRegistered } = await keysFor(cfg, address, eth, keysRef.current);
      if (stale()) return;
      applyKeys(k);
      setRegistered(isRegistered);
      void refreshPublic(address, cfg);
      if (isRegistered) {
        setPhase("syncing");
        await syncNow(k);
      }
      if (!stale()) setPhase("ready");
    } catch (e) {
      if (stale()) return;
      reset();
      setError(friendlyError(e, cfg.nativeSymbol));
    }
  }, [configs, address, phase, refreshPublic, reset, syncNow]);

  // wallet switched account or chain: start over / ask to switch back
  useEffect(() => {
    const eth = ethRef.current;
    if (!eth?.on || !address) return;
    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts?.length || ethers.getAddress(accounts[0]) !== address) reset();
    };
    const onChain = (...args: unknown[]) => setWrongChain(Number(args[0] as string) !== chainRef.current.config?.chainId);
    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [address, reset]);

  const switchChain = useCallback(async () => {
    const cfg = chainRef.current.config;
    if (!ethRef.current || !cfg) return;
    try {
      await W.ensureChain(ethRef.current, cfg);
      setWrongChain(false);
    } catch (e) {
      setError(friendlyError(e, cfg.nativeSymbol));
    }
  }, []);

  /* ─── transaction plumbing ───────────────────────────────────────── */

  const step = (patch: Partial<TxState>) => setTx((t) => (t ? { ...t, ...patch } : t));
  const begin = (kind: TxKind, title: string, steps: string[], message: string) => setTx({ kind, title, steps, step: 0, status: "running", message });
  const fail = (e: unknown) => {
    setTx((t) => (t ? { ...t, status: "error", error: friendlyError(e, config?.nativeSymbol, config?.reserveBalance) } : t));
    return false;
  };

  const relayer = (): Recipient => {
    const r = config?.relayer;
    if (!r || "error" in r) throw new Error("The relayer is unavailable right now. Try again in a minute.");
    return { address: r.address, userCommitment: BigInt(r.userCommitment), viewingPublicKey: r.viewingPublicKey };
  };

  /* The user's own transaction, on the chain on screen: the wallet is moved
     there first, so nothing is ever sent on the wrong chain. */
  async function sendOwnTx(data: { to: string; data: string; value?: bigint }) {
    const eth = ethRef.current!;
    const cfg = config!;
    await W.ensureChain(eth, cfg);
    setWrongChain(false);
    const hash = await W.sendFromWallet(cfg, eth, address!, data, cfg.gasBufferPct);
    step({ txHash: hash });
    const receipt = await W.waitForReceipt(cfg, hash);
    lastTxBlockRef.current = receipt.blockNumber;
    void api!.notify(hash).catch(() => {});
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
    begin("register", "Opening your private account", ["Register", "Ready"], `Confirm the registration on ${config.name} in your wallet…`);
    try {
      await sendOwnTx({ to: config.pool, data: W.poolInterface.encodeFunctionData("register", [k.userCommitmentBytes32, k.viewing.ivkPub]) });
      step({ step: 1, message: "Syncing your private balance…" });
      await syncUntil(lastTxBlockRef.current ?? 0, k);
      setRegistered(true);
      step({ status: "success", message: "Your private account is open.", result: `You can now mask tokens and receive private payments on ${config.name}.` });
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
    const needsApproval = !token.native && (await W.allowance(config, token.address, address, config.pool).catch(() => 0n)) < amount;
    begin("mask", `Masking ${amountLabel}`, needsApproval ? ["Approve", "Mask", "Hidden"] : ["Confirm", "Mask", "Hidden"], "Preparing your private note…");
    try {
      let recipient: Recipient = { address, userCommitment: k.userCommitment, viewingPublicKey: k.viewing.ivkPub };
      if (to && ethers.getAddress(to) !== address) {
        const reg = await W.registrationOf(config, config.pool, to);
        if (!reg.registered) throw new Error(`That address has not registered with Menoid on ${config.name}, so it cannot receive a masked balance.`);
        recipient = { address: reg.address, userCommitment: reg.userCommitment, viewingPublicKey: reg.viewingPublicKey };
      }
      const built = buildDeposit({ token: token.address, amount, recipient });

      if (token.native) {
        step({ message: "Confirm in your wallet…" });
        // Monad's reserve rule (wallet.ts): taking the wallet under its reserve
        if (hasReserve(config)) {
          const reserve = ethers.parseEther(config.reserveBalance!);
          const balance = await W.publicBalance(config, token, address);
          if (balance - amount < reserve) {
            if (await W.isSmartAccount(config, address)) {
              const max = balance > reserve ? balance - reserve : 0n;
              throw new Error(
                `Your wallet is a smart account (EIP-7702), and ${config.name} makes smart accounts keep ${config.reserveBalance} ${token.symbol}, so this would fail. ` +
                  `Mask up to ${formatAmount(max, token.decimals)} ${token.symbol}, or switch it back to a standard account in your wallet.`
              );
            }
            await W.waitForReserveWindow(config, address, config.reserveDelayBlocks, () => step({ message: "Waiting a few blocks (Monad's reserve rule)…" }));
          }
        }
        step({ step: 1, message: `Hiding your ${token.symbol} in the pool…` });
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
    const chain = api!;
    const v = await freshView(k);
    const firstQuote = await chain.fee(kind, token.address, 1);
    let calls = planBatches(v.unspent, token.address, amount, BigInt(firstQuote.feePerCall)).length;
    const quote = calls > 1 ? await chain.fee(kind, token.address, calls) : firstQuote;

    return relayWithFee(BigInt(quote.feePerCall), async (feePerCall) => {
      const batches = planBatches(v.unspent, token.address, amount, feePerCall);
      calls = batches.length;
      step({ step: 0, message: calls > 1 ? `Forging ${calls} zero-knowledge proofs…` : "Forging the zero-knowledge proof…" });
      const common = { chainId: config!.chainId, pool: config!.pool, mirror: mirrorRef.current, sender: k, relayer: relayer(), fee: feePerCall, prove: proverFor(config!.provingKeys) };
      const callsBuilt = [];
      for (const batch of batches) {
        const built =
          kind === "transfer"
            ? await buildTransfer({ ...common, notes: batch.notes, token: token.address, amount: batch.amount, recipient: target.recipient! })
            : await buildWithdraw({ ...common, notes: batch.notes, token: token.address, amount: batch.amount, to: target.to!, unwrapNative: Boolean(token.native) });
        callsBuilt.push(built.call);
      }
      step({ step: 1, message: kind === "transfer" ? "The relayer is carrying it across…" : "The relayer is delivering it…" });
      return chain.relay(kind, callsBuilt);
    });
  }

  const send = useCallback(async (token: TokenConfig, amount: bigint, to: string) => {
    const k = keysRef.current;
    if (!k || !config) return false;
    const amountLabel = `${formatAmount(amount, token.decimals)} ${token.symbol}`;
    begin("send", `Sending ${amountLabel}`, ["Prove", "Relay", "Delivered"], "Checking the recipient…");
    try {
      const reg = await W.registrationOf(config, config.pool, to);
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
  }, [config, api, syncNow, syncUntil]);

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
  }, [config, api, syncNow, syncUntil, refreshPublic]);

  const swap = useCallback(async (tokenIn: TokenConfig, amountIn: bigint, tokenOut: TokenConfig, slippageBps: number) => {
    const k = keysRef.current;
    if (!k || !config || !api) return false;
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
          prove: proverFor(config.provingKeys),
          tokenIn: tokenIn.address,
          amountIn,
          tokenOut: tokenOut.address,
          minAmountOut,
          adapter: quote.adapter,
          routeData: quote.path,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 900),
        });
        step({ step: 2, message: `The pool is trading on ${quote.venueName ?? "Uniswap V3"}…` });
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
  }, [config, api, syncNow, syncUntil]);

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
  }, [address, config, refreshPublic]);

  /** Someone shared a full viewing key: decrypt their activity on this chain, here. Read-only. */
  const inspectViewingKey = useCallback(async (encoded: string): Promise<InspectResult> => {
    const cfg = chainRef.current.config;
    const chain = chainRef.current.api;
    if (!cfg || !chain) throw new Error("Still loading — try again in a moment.");
    const key = decodeViewingKey(encoded);
    if (key.network !== cfg.keyNetwork) throw new Error(`This viewing key is for ${key.network}; ${cfg.name} uses ${cfg.keyNetwork} keys.`);
    const reg = await W.registrationOf(cfg, cfg.pool, key.address);
    const sameIdentity = reg.registered && reg.userCommitment === key.userCommitment;
    await mirrorRef.current.sync((since) => chain.sync(since));
    const v = scan(mirrorRef.current, { ...key, viewingEpoch: sameIdentity ? reg.viewingEpoch : 0 });
    return { address: key.address, registered: sameIdentity, view: v };
  }, []);

  return {
    chains,
    chainId,
    selectChain,
    api,
    tokens,
    lookupToken,
    addToken,
    removeToken,
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
    smartAccount,
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
