/**
 * The user's own wallet (MetaMask, Rabby, …) through EIP-1193, and a
 * read-only connection to the chain.
 *
 * The wallet only ever signs: the key message once per session, and the
 * user's own public transactions (register, approve, mask). Private
 * transactions are proven in the browser and sent by the relayer.
 */
import { ethers } from "ethers";

export type Eip1193 = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export const MONAD_TESTNET = {
  chainId: 10143,
  hex: "0x279f",
  name: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  explorer: "https://testnet.monadvision.com",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
};

export const explorerTx = (hash: string) => `${MONAD_TESTNET.explorer}/tx/${hash}`;

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

/* A minimal EIP-1193 wallet around a private key, for local testing only. */
function devWallet(privateKey: string): Eip1193 {
  const wallet = new ethers.Wallet(privateKey, readProvider());
  return {
    async request({ method, params }) {
      const args = (params ?? []) as unknown[];
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [wallet.address];
        case "eth_chainId":
          return MONAD_TESTNET.hex;
        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain":
          return null;
        case "personal_sign":
          return wallet.signMessage(ethers.getBytes(args[0] as string));
        case "eth_sendTransaction": {
          const tx = args[0] as { to: string; data: string; value?: string; gas?: string };
          const sent = await wallet.sendTransaction({ to: tx.to, data: tx.data, value: BigInt(tx.value ?? 0), gasLimit: tx.gas ? BigInt(tx.gas) : undefined });
          return sent.hash;
        }
        default:
          return readProvider().send(method, args);
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

export async function ensureMonadTestnet(eth: Eip1193) {
  if ((await currentChainId(eth)) === MONAD_TESTNET.chainId) return;
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MONAD_TESTNET.hex }] });
  } catch (error) {
    const code = (error as { code?: number })?.code;
    if (code !== 4902 && code !== -32603) throw error;
    await eth.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: MONAD_TESTNET.hex,
          chainName: MONAD_TESTNET.name,
          nativeCurrency: MONAD_TESTNET.nativeCurrency,
          rpcUrls: [MONAD_TESTNET.rpcUrl],
          blockExplorerUrls: [MONAD_TESTNET.explorer],
        },
      ],
    });
  }
}

export async function personalSign(eth: Eip1193, address: string, message: string): Promise<string> {
  const hex = ethers.hexlify(ethers.toUtf8Bytes(message));
  return (await eth.request({ method: "personal_sign", params: [hex, address] })) as string;
}

/* ─── reads: a direct RPC connection, never the wallet's ──────────────── */

let reader: ethers.JsonRpcProvider | null = null;
export function readProvider(): ethers.JsonRpcProvider {
  if (!reader) {
    const network = ethers.Network.from(MONAD_TESTNET.chainId);
    reader = new ethers.JsonRpcProvider(MONAD_TESTNET.rpcUrl, network, { staticNetwork: network, batchMaxCount: 1 });
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

export async function publicBalance(token: { address: string; native?: boolean }, owner: string): Promise<bigint> {
  const p = readProvider();
  if (token.native) return p.getBalance(owner);
  return BigInt(await new ethers.Contract(token.address, ERC20, p).balanceOf(owner));
}

export async function allowance(token: string, owner: string, spender: string): Promise<bigint> {
  return BigInt(await new ethers.Contract(token, ERC20, readProvider()).allowance(owner, spender));
}

/** Read straight from the pool — a recipient's identity never comes from a server. */
export async function registrationOf(pool: string, address: string) {
  const [uc, viewingPublicKey, keyIndex, viewingEpoch] = await new ethers.Contract(pool, POOL, readProvider()).registrationOf(address);
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

export async function isKnownRoot(pool: string, treeId: number, root: string): Promise<boolean> {
  return Boolean(await new ethers.Contract(pool, POOL, readProvider()).isKnownRoot(treeId, root));
}

/* ─── the user's own transactions ──────────────────────────────────────── */

/** Send a transaction from the connected wallet; gas limit = estimate + buffer (Monad charges the limit). */
export async function sendFromWallet(
  eth: Eip1193,
  from: string,
  tx: { to: string; data: string; value?: bigint },
  bufferPct = 110
): Promise<string> {
  const p = readProvider();
  const estimate = await p.estimateGas({ from, to: tx.to, data: tx.data, value: tx.value ?? 0n });
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

export async function waitForReceipt(hash: string, timeoutMs = 120_000) {
  const receipt = await readProvider().waitForTransaction(hash, 1, timeoutMs);
  if (!receipt) throw new Error("The transaction did not confirm in time");
  if (receipt.status !== 1) throw new Error("The transaction reverted on-chain");
  return receipt;
}

/* Monad's reserve rule: an account under 10 MON may only send value in its
   first transaction in 3 blocks. Before a native deposit, wait until the
   wallet's last transaction is at least that far back. */
export async function waitForReserveWindow(lastTxBlock: number | null, delayBlocks: number, onWait?: () => void) {
  if (lastTxBlock === null) return;
  const p = readProvider();
  let waited = false;
  for (let i = 0; i < 40; i++) {
    const head = await p.getBlockNumber();
    if (head >= lastTxBlock + delayBlocks) return;
    if (!waited) onWait?.();
    waited = true;
    await new Promise((r) => setTimeout(r, 350));
  }
}

export const shortAddress = (a: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
