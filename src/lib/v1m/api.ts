/**
 * The website backend's v1-mainnet API (/api/v1m): the chains, and per chain
 * (/api/v1m/<chain>/…) its config, sync, quotes, prices and the relayer. The
 * browser never sends it a key, and nothing it asks reveals which notes are
 * its own.
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_V1M_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5010"
).replace(/\/+$/, "");

export type TokenConfig = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  native?: boolean;
  wrapped?: string;
  stable?: boolean;
  faucet?: boolean; // anyone can mint() it
  faucetUrl?: string; // or get it from this faucet
  logo?: string; // served by this site (public/tokens): no third-party requests
  pegTo?: string;
  meme?: boolean; // a memecoin (the picker can show just these)
  popular?: boolean; // one of the picker's quick chips
  // a token beyond the chain's list (a user pasted its address):
  custom?: boolean;
  enabled?: boolean; // the pool accepts deposits of it (and swaps into it)
  relayable?: boolean; // the relayer can price it, so it can take its fee in it
  priceUsd?: number;
};

/** /token/:address — any token, as the backend sees it on this chain. */
export type TokenLookup = TokenConfig & { listed: boolean; enabled: boolean; maxDeposit: string; priceUsd: number; relayable: boolean };

/** A chain the app runs on, as the chain switcher and the wallet need it. */
export type ChainInfo = {
  id: string; // "monad-testnet", "base-sepolia"
  name: string;
  shortName: string;
  chainId: number;
  keyNetwork: "mainnet" | "testnet";
  nativeSymbol: string;
  nativeName: string;
  rpcUrl: string; // public endpoint, for reads and for adding the chain to a wallet
  explorer: string;
  provingKeys: "testnet" | "mainnet"; // which trusted setup its verifiers use
};

export type AppConfig = ChainInfo & {
  pool: string;
  deployBlock: number;
  swapAdapter: string;
  uniswap: { official: boolean; factory: string; swapRouter02: string; quoterV2: string };
  venues?: { id: string; name: string; adapter: string }[]; // where swaps route: Uniswap V3, Capricorn (Monad)
  tokens: TokenConfig[];
  feePolicy: { profitPct: number; slackPct: number; notesPerSweep: number };
  relayer: { address: string; userCommitment: string; viewingPublicKey: string; registered: boolean } | { error: string };
  gasBufferPct: number;
  gasReserve: string; // native coin left in the wallet when masking it all
  reserveBalance?: string; // Monad: native coin an account sending it must keep ("10"); "0" elsewhere
  reserveDelayBlocks: number;
};

export type SyncResponse = {
  chainId: number;
  indexedBlock: number;
  tree: { treeId: number; leaves: number; root: string | null; verified: boolean };
  complete: boolean;
  cursor: number;
  notes: { treeId: number; leafIndex: number; commitment: string; encryptedNote: string; blockNumber: number; txHash: string; seq: number }[];
  nullifiers: { nullifier: string; blockNumber: number; txHash: string; seq: number }[];
  outgoing: { firstNullifier: string; record: string; blockNumber: number; txHash: string; seq: number }[];
  swaps: { commitment: string; tokenIn: string; tokenOut: string; amountIn: string; amountOut: string; adapter: string; blockNumber: number; txHash: string; seq: number }[];
};

export type Registration = {
  address: string;
  registered: boolean;
  userCommitment: string | null;
  viewingPublicKey: string | null;
  keyIndex: number;
  viewingEpoch: number;
};

export type Quote = {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  path: string;
  tokens: string[];
  fees: number[];
  adapter: string;
  venue?: string; // "uniswap-v3", "capricorn"
  venueName?: string;
};

/** The relayer's fee for `calls` proofs: its real gas + sweep cost and a small profit. */
export type FeeQuote = {
  chainId: number;
  kind: "transfer" | "withdraw" | "swap";
  token: string;
  symbol: string;
  decimals: number;
  calls: number;
  hops: number;
  feePerCall: string;
  feeTotal: string;
  feeUsd: number;
  nativeSymbol: string;
  costNative: string; // the relayer's cost: gas (+ L1 data fee on rollups) + cashing out the fee note
  feeNative: string;
  nativeUsd: number;
  gasPriceGwei: number;
  breakdown: {
    gas: number;
    gasPerCall: number;
    executionNative: string;
    l1DataFeeNative: string;
    sweepNative: string;
    profitPct: number;
    slackPct: number;
  };
  validForSeconds: number;
};

export type RelayResult = {
  txHash: string;
  blockNumber: number;
  gasEstimate: string;
  gasLimit: string;
  fee: { token: string; amount: string };
  swap: { amountOut: string; commitment: string; tokenOut: string } | null;
};

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown>;
  constructor(status: number, message: string, body: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const json = (value: unknown) => JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1m${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw new ApiError(0, "The Menoid relayer is unreachable. Check your connection and try again.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.error || `Request failed (${res.status})`, body);
  return body as T;
}

/** The chains the backend serves, and which one to show first. */
export const listChains = () => request<{ default: string; chains: ChainInfo[] }>("/chains");

/** One chain's API. */
export function chainApi(chain: string) {
  const at = (path: string) => `/${encodeURIComponent(chain)}${path}`;
  return {
    chain,
    config: () => request<AppConfig>(at("/config")),
    status: () => request<Record<string, unknown>>(at("/status")),
    sync: (since: number) => request<SyncResponse>(at(`/sync?since=${since}`)),
    registration: (address: string) => request<Registration>(at(`/registration/${address}`)),
    quote: (tokenIn: string, tokenOut: string, amountIn: bigint) =>
      request<Quote>(at(`/quote?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn.toString()}`)),
    prices: () => request<{ prices: Record<string, number> }>(at("/prices")),
    token: (address: string) => request<TokenLookup>(at(`/token/${address}`)),
    fee: (kind: FeeQuote["kind"], token: string, calls = 1, hops = 1) =>
      request<FeeQuote>(at(`/fee?kind=${kind}&token=${token}&calls=${calls}&hops=${hops}`)),
    relay: (kind: "transfer" | "withdraw" | "swap", calls: unknown[]) =>
      request<RelayResult>(at(`/relay/${kind}`), { method: "POST", body: json({ calls }) }),
    notify: (txHash: string) => request<{ indexed: boolean }>(at("/notify"), { method: "POST", body: json({ txHash }) }),
  };
}

export type ChainApi = ReturnType<typeof chainApi>;
