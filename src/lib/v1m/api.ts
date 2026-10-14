/**
 * The website backend's v1-mainnet API (/api/v1m): config, sync, quotes,
 * prices and the relayer. The browser never sends it a key, and nothing it
 * asks reveals which notes are its own.
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
  faucet?: boolean;
};

export type AppConfig = {
  id: string;
  name: string;
  chainId: number;
  keyNetwork: "mainnet" | "testnet";
  nativeSymbol: string;
  pool: string;
  deployBlock: number;
  swapAdapter: string;
  uniswap: { factory: string; swapRouter02: string; quoterV2: string };
  tokens: TokenConfig[];
  feePolicy: { profitPct: number; slackPct: number; notesPerSweep: number };
  relayer: { address: string; userCommitment: string; viewingPublicKey: string; registered: boolean } | { error: string };
  gasBufferPct: number;
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
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  path: string;
  tokens: string[];
  fees: number[];
  adapter: string;
};

/** The relayer's fee for `calls` proofs: its real gas + sweep cost and a small profit. */
export type FeeQuote = {
  kind: "transfer" | "withdraw" | "swap";
  token: string;
  symbol: string;
  decimals: number;
  calls: number;
  hops: number;
  feePerCall: string;
  feeTotal: string;
  feeUsd: number;
  costMON: string;
  feeMON: string;
  monUsd: number;
  gasPriceGwei: number;
  breakdown: { gas: number; gasPerCall: number; executionMON: string; sweepMON: string; profitPct: number; slackPct: number };
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

export const api = {
  config: () => request<AppConfig>("/config"),
  status: () => request<Record<string, unknown>>("/status"),
  sync: (since: number) => request<SyncResponse>(`/sync?since=${since}`),
  registration: (address: string) => request<Registration>(`/registration/${address}`),
  quote: (tokenIn: string, tokenOut: string, amountIn: bigint) =>
    request<Quote>(`/quote?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${amountIn.toString()}`),
  prices: () => request<{ prices: Record<string, number> }>("/prices"),
  fee: (kind: FeeQuote["kind"], token: string, calls = 1, hops = 1) =>
    request<FeeQuote>(`/fee?kind=${kind}&token=${token}&calls=${calls}&hops=${hops}`),
  relay: (kind: "transfer" | "withdraw" | "swap", calls: unknown[]) =>
    request<RelayResult>(`/relay/${kind}`, { method: "POST", body: json({ calls }) }),
  notify: (txHash: string) => request<{ indexed: boolean }>("/notify", { method: "POST", body: json({ txHash }) }),
};
