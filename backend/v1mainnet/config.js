/**
 * Menoid v1-mainnet — network configuration.
 *
 * Monad testnet for now (chain 10143). Addresses come from the protocol repo's
 * deployment records (menoid/evms/deployments/monadTestnet*.json). Mainnet will
 * be a second entry here with its own addresses, its own relayer key and
 * MAINNET keys (the key message names the network; see keyNetwork).
 */

const env = (name, fallback) => (process.env[name] ? process.env[name] : fallback);

// Monad testnet: the canonical wrapped MON, plus two test tokens anyone can mint
const WMON = "0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541";
const MUSDC = "0xE0DF03E4F95adaB2DcF5aa06e6eb6C497feE5FfF";
const MTKN = "0x0D62F4fb9B6636B2509341F0b611883b7Db9Da29";

export const V1M = Object.freeze({
  id: "monad-testnet",
  name: "Monad Testnet",
  chainId: 10143,
  // which key message users sign: "testnet" keys never touch mainnet notes
  keyNetwork: "testnet",
  rpcUrl: env("V1M_RPC_URL", "https://testnet-rpc.monad.xyz"),
  nativeSymbol: "MON",

  pool: env("V1M_POOL", "0xa63D29F39BF7A0BcB8E761C1897995ecBAFe496A"),
  deployBlock: Number(env("V1M_DEPLOY_BLOCK", "70943938")),
  swapAdapter: "0x817F8a1A6eB70943f4577a0Bcd335Bc2CD582edC",

  uniswap: {
    factory: "0xdcD3da4C1f3bC88c2aE998FD374f737F1167c7f3",
    swapRouter02: "0x40B3d08778313619b2671Dd79788B7616e257Ede",
    quoterV2: "0xA964C148713A779701684876507B79CA5b6D07d0",
    // the backend only routes through these
    connectors: [WMON, MUSDC],
    feeTiers: [100, 500, 3000, 10000],
  },

  /* Private tokens. MON is held privately as WMON: the pool wraps on the
     way in and can unwrap on the way out, so the app shows it as MON. */
  tokens: [
    { symbol: "MON", name: "Monad", address: WMON, decimals: 18, native: true, wrapped: "WMON" },
    { symbol: "mUSDC", name: "Menoid Test USD", address: MUSDC, decimals: 6, stable: true, faucet: true },
    { symbol: "mTKN", name: "Menoid Test Token", address: MTKN, decimals: 18, faucet: true },
  ],

  /* The relayer's fee (see fees.js): what a proof really costs it in MON —
     the gas it pays now plus the later cost of cashing out the fee note — plus
     a little profit, converted into the token being spent. */
  fees: {
    profitPct: 5, // the relayer's target profit
    slackPct: 10, // room for gas price / route drift between quote and relay
    notesPerSweep: 4, // fee notes the relayer cashes out per withdraw proof
    quoteTtlSec: 60,
    // gas per relayed transaction = fixed + perCall × proofs. Measured on Monad
    // testnet (2026-10-14); replaced by live measurements as relays confirm.
    defaults: {
      transfer: { fixed: 112600, perCall: 1948000 },
      withdraw: { fixed: 112600, perCall: 1967000 },
      swap1: { fixed: 112600, perCall: 2295500 },
      swap2: { fixed: 112600, perCall: 2456400 },
    },
  },

  /* Prices: MON at its real market price — Monad MAINNET's deepest MON/USDC
     Uniswap V3 pool — even on testnet; mUSDC = $1; other test tokens by the
     testnet's own pools against mUSDC. */
  priceSource: {
    rpcUrl: env("V1M_PRICE_RPC_URL", "https://rpc.monad.xyz"),
    chainId: 143,
    factory: "0x204FAca1764B154221e35c0d20aBb3c525710498",
    wmon: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A",
    usdc: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    feeTiers: [500, 3000, 10000],
  },

  indexer: {
    logWindow: 100, // Monad caps eth_getLogs ranges
    pollMs: Number(env("V1M_POLL_MS", "1500")),
  },

  // gas limit = estimate + 10% (Monad charges the limit, not the gas used)
  gasBufferPct: 110,
  // Monad's minimum reserve: an account below it may only move value in its
  // first transaction in 3 blocks
  reserveDelayBlocks: 3,
});

export const TOKEN_BY_ADDRESS = Object.freeze(
  Object.fromEntries(V1M.tokens.map((t) => [t.address.toLowerCase(), t]))
);

export function tokenInfo(address) {
  return TOKEN_BY_ADDRESS[String(address).toLowerCase()] || null;
}
