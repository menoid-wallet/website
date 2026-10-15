/**
 * The user's own wallet (MetaMask, Rabby, …) through EIP-1193, and read-only
 * connections to each chain.
 *
 * The wallet only ever signs: the key message once per session, and the
 * user's own public transactions (register, approve, mask). Private
 * transactions are proven in the browser and sent by the relayer.
 */
import { ethers } from "ethers";

import type { ChainInfo } from "./api.ts";

export type Eip1193 = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

/** What reading from a chain needs. */
export type ChainRef = Pick<ChainInfo, "chainId" | "rpcUrl">;

export const explorerTx = (explorer: string, hash: string) => `${explorer}/tx/${hash}`;
const hexChainId = (chainId: number) => ethers.toQuantity(chainId);

// every chain the app has seen, so the dev wallet can follow a switch
const knownChains = new Map<number, ChainInfo>();
export function rememberChains(chains: ChainInfo[]) {
  for (const c of chains) knownChains.set(c.chainId, c);
}

/* ─── which wallet: EIP-6963 discovery ───────────────────────────────────
   Several extensions fight over window.ethereum (Phantom usually wins).
   EIP-6963 lets each installed wallet announce itself — name, icon,
   provider — so the user picks the one to use. A wallet that only sets
   window.ethereum still shows up, as a fallback. */

export type WalletOption = { id: string; name: string; icon?: string; rdns?: string; provider: Eip1193 };

type Announcement = { info?: { uuid: string; name: string; icon: string; rdns: string }; provider?: Eip1193 };
type LegacyEthereum = Eip1193 & { isMetaMask?: boolean; isPhantom?: boolean; isRabby?: boolean; isCoinbaseWallet?: boolean; isOkxWallet?: boolean };

function legacyName(eth: LegacyEthereum): string {
  if (eth.isPhantom) return "Phantom";
  if (eth.isRabby) return "Rabby";
  if (eth.isCoinbaseWallet) return "Coinbase Wallet";
  if (eth.isOkxWallet) return "OKX Wallet";
  if (eth.isMetaMask) return "MetaMask";
  return "Browser wallet";
}

/** Calls onChange with every wallet found so far; returns an unsubscribe. */
export function watchWallets(onChange: (wallets: WalletOption[]) => void): () => void {
  const found = new Map<string, WalletOption>();
  const emit = () => onChange([...found.values()]);

  // development only (compiled out of production builds): a test key set on
  // window.__menoidDevKey shows up as a wallet, to test without an extension
  if (process.env.NODE_ENV !== "production") {
    const devKey = (window as unknown as { __menoidDevKey?: string }).__menoidDevKey;
    if (devKey) found.set("dev", { id: "dev", name: "Test wallet (dev only)", provider: devWallet(devKey) });
  }

  const onAnnounce = (event: Event) => {
    const { info, provider } = ((event as CustomEvent<Announcement>).detail ?? {}) as Announcement;
    if (!info || !provider) return;
    const id = info.rdns || info.uuid;
    if (found.has(id)) return;
    found.set(id, { id, name: info.name, icon: info.icon, rdns: info.rdns, provider });
    emit();
  };
  window.addEventListener("eip6963:announceProvider", onAnnounce);
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  const legacy = window.setTimeout(() => {
    const eth = (window as unknown as { ethereum?: LegacyEthereum }).ethereum;
    if (eth && ![...found.values()].some((w) => w.provider === eth)) {
      found.set("injected", { id: "injected", name: legacyName(eth), provider: eth });
    }
    emit();
  }, 350);
  emit();

  return () => {
    window.removeEventListener("eip6963:announceProvider", onAnnounce);
    window.clearTimeout(legacy);
  };
}

/* A minimal EIP-1193 wallet around a private key, for local testing only.
   It follows wallet_switchEthereumChain to any chain the app knows. */
function devWallet(privateKey: string): Eip1193 {
  let chainId = [...knownChains.keys()][0] ?? 10143;
  const chain = () => {
    const c = knownChains.get(chainId);
    if (!c) throw new Error(`dev wallet: unknown chain ${chainId}`);
    return c;
  };
  return {
    async request({ method, params }) {
      const args = (params ?? []) as unknown[];
      const wallet = new ethers.Wallet(privateKey, readProvider(chain()));
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [wallet.address];
        case "eth_chainId":
          return hexChainId(chainId);
        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain": {
          const next = Number((args[0] as { chainId: string }).chainId);
          if (!knownChains.has(next)) throw Object.assign(new Error("unknown chain"), { code: 4902 });
          chainId = next;
          return null;
        }
        case "personal_sign":
          return wallet.signMessage(ethers.getBytes(args[0] as string));
        case "eth_sendTransaction": {
          const tx = args[0] as { to: string; data: string; value?: string; gas?: string };
          const sent = await wallet.sendTransaction({ to: tx.to, data: tx.data, value: BigInt(tx.value ?? 0), gasLimit: tx.gas ? BigInt(tx.gas) : undefined });
          return sent.hash;
        }
        default:
          return readProvider(chain()).send(method, args);
      }
    },
  };
}

export async function connectWallet(eth: Eip1193): Promise<string> {
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.length) throw new Error("No account was shared by the wallet");
  return ethers.getAddress(accounts[0]);
}

export async function currentChainId(eth: Eip1193): Promise<number> {
  return Number(await eth.request({ method: "eth_chainId" }));
}

/** Ask the wallet to switch to `chain`, adding it first if the wallet does not know it. */
export async function ensureChain(eth: Eip1193, chain: ChainInfo) {
  if ((await currentChainId(eth)) === chain.chainId) return;
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexChainId(chain.chainId) }] });
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 4902 && code !== -32603) throw error;
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: hexChainId(chain.chainId),
          chainName: chain.name,
          nativeCurrency: { name: chain.nativeName, symbol: chain.nativeSymbol, decimals: 18 },
          rpcUrls: [chain.rpcUrl],
          blockExplorerUrls: [chain.explorer],
        },
      ],
    });
  }
}

export async function personalSign(eth: Eip1193, address: string, message: string): Promise<string> {
  const hex = ethers.hexlify(ethers.toUtf8Bytes(message));
  return (await eth.request({ method: "personal_sign", params: [hex, address] })) as string;
}

/* ─── reads: a direct RPC connection per chain, never the wallet's ───── */

const readers = new Map<number, ethers.JsonRpcProvider>();
export function readProvider(chain: ChainRef): ethers.JsonRpcProvider {
  let reader = readers.get(chain.chainId);
  if (!reader) {
    const network = ethers.Network.from(chain.chainId);
    reader = new ethers.JsonRpcProvider(chain.rpcUrl, network, { staticNetwork: network, batchMaxCount: 1 });
    readers.set(chain.chainId, reader);
  }
  return reader;
}

const ERC20 = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
];

const POOL = [
  "function registrationOf(address) view returns (bytes32 userCommitment, bytes viewingPublicKey, uint32 keyIndex, uint32 viewingEpoch)",
  "function isKnownRoot(uint256 treeId, bytes32 root) view returns (bool)",
  "function register(bytes32 userCommitment, bytes viewingPublicKey)",
  "function deposit(address token, uint256 amount, bytes32 npk, bytes encryptedNote)",
  "function depositNative(bytes32 npk, bytes encryptedNote) payable",
  "function tokenConfig(address) view returns (bool depositsEnabled, uint128 maxDeposit)",
];

export const erc20Interface = new ethers.Interface(ERC20);
export const poolInterface = new ethers.Interface(POOL);

export async function publicBalance(chain: ChainRef, token: { address: string; native?: boolean }, owner: string): Promise<bigint> {
  const p = readProvider(chain);
  if (token.native) return p.getBalance(owner);
  return BigInt(await new ethers.Contract(token.address, ERC20, p).balanceOf(owner));
}

// Multicall3 sits at this address on Monad, Base and most EVM chains
const MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11";
const multicall = new ethers.Interface([
  "function aggregate3((address target, bool allowFailure, bytes callData)[] calls) payable returns ((bool success, bytes returnData)[] returnData)",
  "function getEthBalance(address addr) view returns (uint256 balance)",
]);

/** Every token's public balance in ONE eth_call (Multicall3); one call per token if that fails. */
export async function publicBalances(chain: ChainRef, tokens: { address: string; native?: boolean }[], owner: string): Promise<Record<string, bigint>> {
  const p = readProvider(chain);
  const calls = tokens.map((t) =>
    t.native
      ? { target: MULTICALL3, allowFailure: true, callData: multicall.encodeFunctionData("getEthBalance", [owner]) }
      : { target: t.address, allowFailure: true, callData: erc20Interface.encodeFunctionData("balanceOf", [owner]) }
  );
  try {
    const raw = await p.call({ to: MULTICALL3, data: multicall.encodeFunctionData("aggregate3", [calls]) });
    const [results] = multicall.decodeFunctionResult("aggregate3", raw);
    return Object.fromEntries(
      tokens.map((t, i) => {
        const r = results[i];
        return [t.address, r.success && r.returnData !== "0x" ? BigInt(r.returnData) : 0n];
      })
    );
  } catch {
    const entries = await Promise.all(tokens.map(async (t) => [t.address, await publicBalance(chain, t, owner).catch(() => 0n)] as const));
    return Object.fromEntries(entries);
  }
}

export async function allowance(chain: ChainRef, token: string, owner: string, spender: string): Promise<bigint> {
  return BigInt(await new ethers.Contract(token, ERC20, readProvider(chain)).allowance(owner, spender));
}

/** Read straight from the pool — a recipient's identity never comes from a server. */
export async function registrationOf(chain: ChainRef, pool: string, address: string) {
  const [uc, viewingPublicKey, keyIndex, viewingEpoch] = await new ethers.Contract(pool, POOL, readProvider(chain)).registrationOf(address);
  const userCommitment = BigInt(uc);
  return {
    address: ethers.getAddress(address),
    registered: userCommitment !== 0n,
    userCommitment,
    viewingPublicKey: viewingPublicKey as string,
    keyIndex: Number(keyIndex),
    viewingEpoch: Number(viewingEpoch),
  };
}

export async function isKnownRoot(chain: ChainRef, pool: string, treeId: number, root: string): Promise<boolean> {
  return Boolean(await new ethers.Contract(pool, POOL, readProvider(chain)).isKnownRoot(treeId, root));
}

/* ─── the user's own transactions ──────────────────────────────────────── */

/** Send a transaction from the connected wallet; gas limit = estimate + buffer (Monad bills the limit, so keep it tight there). */
export async function sendFromWallet(
  chain: ChainRef,
  eth: Eip1193,
  from: string,
  tx: { to: string; data: string; value?: bigint },
  bufferPct = 110
): Promise<string> {
  const estimate = await readProvider(chain).estimateGas({ from, to: tx.to, data: tx.data, value: tx.value ?? 0n });
  const gas = (estimate * BigInt(bufferPct)) / 100n;
  return (await eth.request({
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: tx.to,
        data: tx.data,
        value: tx.value ? ethers.toQuantity(tx.value) : "0x0",
        gas: ethers.toQuantity(gas),
      },
    ],
  })) as string;
}

export async function waitForReceipt(chain: ChainRef, hash: string, timeoutMs = 120_000) {
  const receipt = await readProvider(chain).waitForTransaction(hash, 1, timeoutMs);
  if (!receipt) throw new Error("The transaction did not confirm in time");
  if (receipt.status !== 1) throw new Error("The transaction reverted on-chain");
  return receipt;
}

/* ─── Monad's reserve balance ─────────────────────────────────────────────
   When MON leaves an account, Monad makes it keep 10 MON — the check is on
   the account's balance, whoever sends the transaction. One exception: a
   standard account's only transaction in 3 blocks may take it lower (an
   "emptying" transaction). A smart account (an EOA delegated with EIP-7702,
   e.g. a MetaMask smart account) never gets it, so it always keeps 10 MON.
   (Other chains: no reserve.) */

/** Is `address` a smart account here (delegated with EIP-7702)? */
export async function isSmartAccount(chain: ChainRef, address: string): Promise<boolean> {
  const code = await readProvider(chain).getCode(address);
  return code.toLowerCase().startsWith("0xef0100");
}

/** Before an emptying transaction: wait until the wallet has sent nothing in the last `delayBlocks` blocks. Read from the chain (its nonce then and now), so a transaction from another app counts too. */
export async function waitForReserveWindow(chain: ChainRef, address: string, delayBlocks: number, onWait?: () => void) {
  if (delayBlocks <= 0) return;
  const p = readProvider(chain);
  const quiet = async () => {
    const head = await p.getBlockNumber();
    const [before, now, pending] = await Promise.all([
      p.getTransactionCount(address, Math.max(0, head - delayBlocks)),
      p.getTransactionCount(address, head),
      p.getTransactionCount(address, "pending"),
    ]);
    return before === now && now === pending;
  };
  for (let i = 0; i < 60; i++) {
    // a node that cannot say: the gas estimate still checks the rule before anything is sent
    if (await quiet().catch(() => true)) return;
    if (i === 0) onWait?.();
    await new Promise((r) => setTimeout(r, 400));
  }
}

export const shortAddress = (a: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
