/**
 * Menoid v1-mainnet — network configuration, one entry per chain.
 *
 *   monad          Monad MAINNET (143): mainnet keys, the ceremony's verifiers,
 *                  its own relayer key (V1M_MAINNET_RELAYER_PRIVATE_KEY)
 *   base           Base MAINNET (8453): the same, and the same relayer key
 *   monad-testnet  Monad testnet (10143)      testnet keys, development setup,
 *   base-sepolia   Base Sepolia (84532)       relayer key V1M_RELAYER_PRIVATE_KEY
 *
 * Addresses come from the protocol repo's deployment records
 * (menoid/evms/deployments/monadMainnet.json, monadTestnet*.json,
 * baseSepoliaV1m*.json). V1M_CHAINS picks which chains this server runs
 * ("monad" for a mainnet-only server); by default every chain that has a pool.
 */

const env = (name, fallback) => (process.env[name] ? process.env[name] : fallback);

/* The relayer's fee (see fees.js): what a proof really costs it in the
   chain's native coin — the gas it pays now plus the later cost of cashing out
   the fee note — plus a little profit, converted into the token being spent. */
const FEE_POLICY = {
  profitPct: 5, // the relayer's target profit
  slackPct: 10, // room for gas price / route drift between quote and relay
  notesPerSweep: 4, // fee notes the relayer cashes out per withdraw proof
  quoteTtlSec: 60,
};

// calldata per proof in a relayed transaction (measured on Monad testnet):
// sizes the L1 data fee on rollups before a transaction exists
const CALL_BYTES = { transfer: 1640, withdraw: 1540, swap: 2000, base: 100 };

/* ─── Monad testnet ───────────────────────────────────────────────────────
   Uniswap V3 deployed by Menoid (Uniswap's own testnet addresses are empty),
   the canonical wrapped MON, and two test tokens anyone can mint. */

const WMON = "0xFb8bf4c1CC7a94c73D209a149eA2AbEa852BC541";
const MUSDC = "0xE0DF03E4F95adaB2DcF5aa06e6eb6C497feE5FfF";
const MTKN_MONAD = "0x0D62F4fb9B6636B2509341F0b611883b7Db9Da29";

const MONAD_TESTNET = {
  id: "monad-testnet",
  name: "Monad Testnet",
  shortName: "Monad",
  chainId: 10143,
  // which key message users sign: "testnet" keys never touch mainnet notes
  keyNetwork: "testnet",
  rpcUrl: env("V1M_RPC_URL", "https://testnet-rpc.monad.xyz"),
  logsRpcUrl: env("V1M_LOGS_RPC_URL", env("V1M_RPC_URL", "https://testnet-rpc.monad.xyz")),
  publicRpcUrl: "https://testnet-rpc.monad.xyz", // what the browser and wallets use
  explorer: "https://testnet.monadvision.com",
  nativeSymbol: "MON",
  nativeName: "Monad",
  gasReserve: "0.15", // native coin the app leaves in the wallet when masking it all
  relayerKeyEnv: "V1M_RELAYER_PRIVATE_KEY",

  pool: env("V1M_POOL", "0xa63D29F39BF7A0BcB8E761C1897995ecBAFe496A"),
  deployBlock: Number(env("V1M_DEPLOY_BLOCK", "70943938")),
  swapAdapter: "0x817F8a1A6eB70943f4577a0Bcd335Bc2CD582edC",

  uniswap: {
    official: false,
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
    { symbol: "MON", name: "Monad", address: WMON, decimals: 18, native: true, wrapped: "WMON", logo: "/tokens/mon.svg" },
    { symbol: "mUSDC", name: "Menoid Test USD", address: MUSDC, decimals: 6, stable: true, faucet: true, logo: "/tokens/usdc.svg" },
    { symbol: "mTKN", name: "Menoid Test Token", address: MTKN_MONAD, decimals: 18, faucet: true },
  ],

  fees: {
    ...FEE_POLICY,
    // gas per relayed transaction = fixed + perCall × proofs. Measured on Monad
    // testnet (2026-10-14); replaced by live measurements as relays confirm.
    defaults: {
      transfer: { fixed: 112600, perCall: 1948000 },
      withdraw: { fixed: 112600, perCall: 1967000 },
      swap1: { fixed: 112600, perCall: 2295500 },
      swap2: { fixed: 112600, perCall: 2456400 },
    },
  },

  gas: {
    limitPct: 110, // gas limit = estimate + 10%
    chargedOnLimit: true, // Monad bills the LIMIT, not the gas used
    l1DataFee: null,
  },

  /* MON at its real market price — Monad MAINNET's deepest MON/USDC Uniswap
     V3 pool — even on testnet; mUSDC = $1; mTKN by the testnet's own pools. */
  priceSource: {
    rpcUrl: env("V1M_PRICE_RPC_URL", "https://rpc.monad.xyz"),
    chainId: 143,
    factory: "0x204FAca1764B154221e35c0d20aBb3c525710498",
    wrappedNative: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A", // WMON
    usdc: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603",
    feeTiers: [500, 3000, 10000],
  },

  indexer: {
    logWindow: 100, // Monad caps eth_getLogs ranges
    pollMs: Number(env("V1M_POLL_MS", "1500")),
  },

  // Monad's reserve balance: an account that sends MON must keep 10 MON, except
  // a standard account's only transaction in 3 blocks. A smart account
  // (EIP-7702 delegated, e.g. MetaMask's) never gets that exception.
  reserveBalance: "10",
  reserveDelayBlocks: 3,
};

/* ─── Monad mainnet ───────────────────────────────────────────────────────
   Uniswap's own V3 deployment, real MON and Circle's USDC, and Capricorn —
   nad.fun's DEX — for Monad's memecoins. Guarded launch: small per-deposit
   caps (the protocol repo's helpers/mainnet-tokens.js). */

const WMON_MAINNET = "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A";
const USDC_MONAD = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";
const MONAD_SWAP_ADAPTER = env("V1M_MONAD_SWAP_ADAPTER", "0xf5a599fA588C14C4787a090C7a30f2E4C163762B");
// Menoid's V3PoolAdapter for Capricorn (scripts/add-venue.js): it swaps and quotes
const MONAD_CAPRICORN_ADAPTER = env("V1M_MONAD_CAPRICORN_ADAPTER", "0xd6E8F9CaD752A21a741660B3aA244EA065A12cA7");

const MONAD_MAINNET = {
  id: "monad",
  name: "Monad",
  shortName: "Monad",
  chainId: 143,
  keyNetwork: "mainnet",
  rpcUrl: env("V1M_MONAD_RPC_URL", "https://rpc.monad.xyz"),
  logsRpcUrl: env("V1M_MONAD_LOGS_RPC_URL", env("V1M_MONAD_RPC_URL", "https://rpc.monad.xyz")),
  publicRpcUrl: "https://rpc.monad.xyz",
  explorer: "https://monadscan.com",
  nativeSymbol: "MON",
  nativeName: "Monad",
  gasReserve: "0.3",
  relayerKeyEnv: "V1M_MAINNET_RELAYER_PRIVATE_KEY",

  // deployments/monadMainnet.json (2026-10-15); env overrides for rehearsals
  pool: env("V1M_MONAD_POOL", "0x3A3B64E3230C9A9aA32a1395C2c7B909cbe02EFB"),
  deployBlock: Number(env("V1M_MONAD_DEPLOY_BLOCK", "113530136")),
  swapAdapter: MONAD_SWAP_ADAPTER,

  uniswap: {
    official: true,
    factory: "0x204FAca1764B154221e35c0d20aBb3c525710498",
    swapRouter02: "0xfe31f71c1b106eac32f1a19239c9a9a72ddfb900",
    quoterV2: "0x661e93cca42afacb172121ef892830ca3b70f08d",
    connectors: [WMON_MAINNET, USDC_MONAD],
    feeTiers: [100, 500, 3000, 10000],
  },

  // where swaps can route (market.js picks the best quote across them)
  venues: [
    {
      id: "uniswap-v3",
      name: "Uniswap V3",
      factory: "0x204FAca1764B154221e35c0d20aBb3c525710498",
      quoter: "0x661e93cca42afacb172121ef892830ca3b70f08d",
      adapter: MONAD_SWAP_ADAPTER,
      connectors: [WMON_MAINNET, USDC_MONAD],
      feeTiers: [100, 500, 3000, 10000],
    },
    {
      // nad.fun's DEX, a Uniswap V3 fork: Menoid's adapter is its quoter too
      id: "capricorn",
      name: "Capricorn",
      factory: "0x6B5F564339DbAD6b780249827f2198a841FEB7F3",
      quoter: MONAD_CAPRICORN_ADAPTER,
      adapter: MONAD_CAPRICORN_ADAPTER,
      connectors: [WMON_MAINNET, USDC_MONAD],
      feeTiers: [100, 500, 3000, 10000],
    },
  ],

  /* The pool's tokens (helpers/mainnet-tokens.js in the protocol repo): Monad's
     official token list, then memecoins with real liquidity (meme: true; most
     on Capricorn). Prices: stable = $1; pegTo = that token's price; the rest
     by a $1 probe from MON. Any other token the owner enables later works
     too: /token/:address looks it up live. */
  tokens: [
    { symbol: "MON", name: "Monad", address: WMON_MAINNET, decimals: 18, native: true, wrapped: "WMON", logo: "/tokens/mon.svg", popular: true },
    { symbol: "USDC", name: "USD Coin", address: USDC_MONAD, decimals: 6, stable: true, logo: "/tokens/usdc.svg", popular: true },
    { symbol: "USDT0", name: "USDT0", address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", decimals: 6, stable: true, logo: "/tokens/usdt0.svg", popular: true },
    { symbol: "AUSD", name: "Agora Dollar", address: "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a", decimals: 6, stable: true, logo: "/tokens/ausd.svg" },
    { symbol: "USDe", name: "Ethena USDe", address: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34", decimals: 18, stable: true, logo: "/tokens/usde.svg" },
    { symbol: "USD1", name: "World Liberty Financial USD", address: "0x111111d2bf19e43C34263401e0CAd979eD1cdb61", decimals: 6, stable: true, logo: "/tokens/usd1.svg" },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242", decimals: 18, logo: "/tokens/weth.svg", popular: true },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", decimals: 8, logo: "/tokens/wbtc.svg", popular: true },
    { symbol: "cbBTC", name: "Coinbase Wrapped BTC", address: "0xd18B7EC58Cdf4876f6AFebd3Ed1730e4Ce10414b", decimals: 8, pegTo: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", logo: "/tokens/cbbtc.svg" },
    { symbol: "LBTC", name: "Lombard Staked Bitcoin", address: "0xecAc9C5F704e954931349Da37F60E39f515c11c1", decimals: 8, pegTo: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", logo: "/tokens/lbtc.svg" },
    { symbol: "shMON", name: "ShMonad", address: "0x1B68626dCa36c7fE922fD2d55E4f631d962dE19c", decimals: 18, logo: "/tokens/shmon.png" },
    { symbol: "gMON", name: "Magma gMON", address: "0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081", decimals: 18, logo: "/tokens/gmon.svg" },
    { symbol: "sMON", name: "Kintsu Staked Monad", address: "0xA3227C5969757783154C60bF0bC1944180ed81B9", decimals: 18, logo: "/tokens/smon.svg" },
    { symbol: "aprMON", name: "aPriori Monad LST", address: "0x0c65A0BC65a5D819235B71F554D210D3F80E0852", decimals: 18, pegTo: WMON_MAINNET, logo: "/tokens/aprmon.svg" },
    // memecoins: Capricorn (nad.fun), FLING on Uniswap V3
    { symbol: "CHOG", name: "Chog", address: "0x350035555E10d9AfAF1566AaebfCeD5BA6C27777", decimals: 18, meme: true, logo: "/tokens/monad/chog.png", popular: true },
    { symbol: "emo", name: "emonad", address: "0x81A224F8A62f52BdE942dBF23A56df77A10b7777", decimals: 18, meme: true, logo: "/tokens/monad/emo.png" },
    { symbol: "MOLANDAK", name: "Molandak", address: "0x7B2728c04aD436153285702e969e6EfAc3a97777", decimals: 18, meme: true, logo: "/tokens/monad/molandak.png" },
    { symbol: "shramp", name: "shramp", address: "0x42a4aA89864A794dE135B23C6a8D2E05513d7777", decimals: 18, meme: true, logo: "/tokens/monad/shramp.png" },
    { symbol: "BOB", name: "Bob", address: "0x21E325B059Cd83d4037C82F0F5998Ba2dF3d7777", decimals: 18, meme: true, logo: "/tokens/monad/bob.png" },
    { symbol: "ANAGO", name: "Anago", address: "0x3Ec7310937281CA4Bf89D5bB11704bE9b7ff7777", decimals: 18, meme: true, logo: "/tokens/monad/anago.png" },
    { symbol: "MONCAT", name: "MONCAT", address: "0x0158aBFf6D8344B35b5afFFe7DBEFC431B731A70", decimals: 18, meme: true },
    { symbol: "NADS", name: "NADS", address: "0x39B9E06f226FF6D7500c870B82333AACbD2F7777", decimals: 18, meme: true, logo: "/tokens/monad/nads.png" },
    { symbol: "EGG", name: "EGGMON", address: "0xD10cf12099f5Fb424Bc77401DF49f0c785657777", decimals: 18, meme: true, logo: "/tokens/monad/egg.png" },
    { symbol: "HOGDOG", name: "Hog Dog", address: "0xc911Ba7aEE487f5145702c20c20a40d9e5B87777", decimals: 18, meme: true },
    { symbol: "143", name: "143", address: "0x3842751a46D23B41A47E702473dFf316E6237777", decimals: 18, meme: true, logo: "/tokens/monad/143.png" },
    { symbol: "BC", name: "Black Currency", address: "0x228c673cae7aaD0F4D9F309616D6b546356b7777", decimals: 18, meme: true, logo: "/tokens/monad/bc.png" },
    { symbol: "MONI", name: "MONI", address: "0x0CC9B2e2AcD7BACfF79eb7dB48F5662B622E7777", decimals: 18, meme: true, logo: "/tokens/monad/moni.png" },
    { symbol: "FLING", name: "Fling", address: "0xA9da3C77eC7cDc4DfaA1FE142AF583543D1c540F", decimals: 18, meme: true, logo: "/tokens/monad/fling.png" },
  ],

  fees: {
    ...FEE_POLICY,
    // the same contracts as Monad testnet, so its measured gas (2026-10-14)
    defaults: {
      transfer: { fixed: 112600, perCall: 1948000 },
      withdraw: { fixed: 112600, perCall: 1967000 },
      swap1: { fixed: 112600, perCall: 2295500 },
      swap2: { fixed: 112600, perCall: 2456400 },
    },
  },

  gas: { limitPct: 110, chargedOnLimit: true, l1DataFee: null },

  priceSource: {
    rpcUrl: env("V1M_PRICE_RPC_URL", "https://rpc.monad.xyz"),
    chainId: 143,
    factory: "0x204FAca1764B154221e35c0d20aBb3c525710498",
    wrappedNative: WMON_MAINNET,
    usdc: USDC_MONAD,
    feeTiers: [500, 3000, 10000],
  },

  indexer: {
    logWindow: 100, // rpc.monad.xyz caps eth_getLogs at 100 blocks
    pollMs: Number(env("V1M_MONAD_POLL_MS", "2000")),
  },

  reserveBalance: "10", // as on Monad testnet
  reserveDelayBlocks: 3,
};

/* ─── Base Sepolia ────────────────────────────────────────────────────────
   Uniswap's own V3 deployment and its existing WETH/USDC pools (Circle's
   testnet USDC), plus one Menoid test token with a small mTKN/USDC pool. */

const WETH = "0x4200000000000000000000000000000000000006";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const MTKN_BASE = "0xb1943AC6fCAE3205c711f65BAB318c501bDB11b6";

const BASE_SEPOLIA = {
  id: "base-sepolia",
  name: "Base Sepolia",
  shortName: "Base",
  chainId: 84532,
  keyNetwork: "testnet",
  rpcUrl: env("V1M_BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org"),
  // the public endpoint allows 200-block log ranges (free provider tiers: 10)
  logsRpcUrl: env("V1M_BASE_SEPOLIA_LOGS_RPC_URL", "https://sepolia.base.org"),
  publicRpcUrl: "https://sepolia.base.org",
  explorer: "https://sepolia.basescan.org",
  nativeSymbol: "ETH",
  nativeName: "Ether",
  gasReserve: "0.0005",
  relayerKeyEnv: "V1M_RELAYER_PRIVATE_KEY",

  pool: env("V1M_BASE_SEPOLIA_POOL", "0xB74dDD9B6719402334b68cc126eca50744143673"),
  deployBlock: Number(env("V1M_BASE_SEPOLIA_DEPLOY_BLOCK", "48131508")),
  swapAdapter: "0x589abAF22dABE13a4858a8133b5E807C8A1F4faF",

  uniswap: {
    official: true,
    factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    swapRouter02: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
    quoterV2: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27",
    connectors: [WETH, USDC_BASE_SEPOLIA],
    feeTiers: [100, 500, 3000, 10000],
  },

  tokens: [
    { symbol: "ETH", name: "Ether", address: WETH, decimals: 18, native: true, wrapped: "WETH", logo: "/tokens/eth.png" },
    { symbol: "USDC", name: "USD Coin (testnet)", address: USDC_BASE_SEPOLIA, decimals: 6, stable: true, faucetUrl: "https://faucet.circle.com", logo: "/tokens/usdc.svg" },
    { symbol: "mTKN", name: "Menoid Test Token", address: MTKN_BASE, decimals: 18, faucet: true },
  ],

  fees: {
    ...FEE_POLICY,
    // Ethereum gas prices (Hardhat measurements of the same contracts):
    // transfer 1.04M, two in one transaction 1.95M, swap 1.24M / 1.33M.
    // Replaced by live measurements as relays confirm.
    defaults: {
      transfer: { fixed: 130000, perCall: 910000 },
      withdraw: { fixed: 130000, perCall: 910000 },
      swap1: { fixed: 130000, perCall: 1110000 },
      swap2: { fixed: 130000, perCall: 1200000 },
    },
  },

  gas: {
    limitPct: 125, // headroom only: Base bills the gas used
    chargedOnLimit: false,
    l1DataFee: "op-stack", // plus the L1 data fee, from GasPriceOracle
  },

  // ETH at its real price: Base MAINNET's deepest WETH/USDC Uniswap V3 pool
  priceSource: {
    rpcUrl: env("V1M_BASE_PRICE_RPC_URL", "https://mainnet.base.org"),
    chainId: 8453,
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    wrappedNative: WETH,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    feeTiers: [500, 3000, 10000],
  },

  indexer: {
    logWindow: 150,
    pollMs: Number(env("V1M_BASE_SEPOLIA_POLL_MS", "2000")),
  },

  reserveBalance: "0",
  reserveDelayBlocks: 0,
};

/* ─── Base mainnet ────────────────────────────────────────────────────────
   Uniswap's own V3 deployment, real ETH and Circle's USDC, the chain's
   best-known tokens and its memecoins with real Uniswap V3 liquidity.
   Guarded launch: small per-deposit caps (helpers/mainnet-tokens.js). The
   same relayer key as Monad mainnet. */

const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_SWAP_ADAPTER = env("V1M_BASE_SWAP_ADAPTER", "0x30Eb860540aB57523Cb8E35f78B37D89658F2595");

const BASE_MAINNET = {
  id: "base",
  name: "Base",
  shortName: "Base",
  chainId: 8453,
  keyNetwork: "mainnet",
  // reads and logs: publicnode answers fast and serves log ranges over the
  // last ~5,000 blocks (~3 hours); a backend that sleeps longer needs an
  // archive endpoint here (V1M_BASE_LOGS_RPC_URL). mainnet.base.org refuses
  // eth_getLogs on its free tier.
  rpcUrl: env("V1M_BASE_RPC_URL", "https://base-rpc.publicnode.com"),
  logsRpcUrl: env("V1M_BASE_LOGS_RPC_URL", env("V1M_BASE_RPC_URL", "https://base-rpc.publicnode.com")),
  publicRpcUrl: "https://mainnet.base.org",
  explorer: "https://basescan.org",
  nativeSymbol: "ETH",
  nativeName: "Ether",
  gasReserve: "0.0003",
  relayerKeyEnv: "V1M_MAINNET_RELAYER_PRIVATE_KEY",

  // deployments/baseMainnet.json (2026-10-15); env overrides for rehearsals
  pool: env("V1M_BASE_POOL", "0x436968db6B2B8E729cB21498030c5ebFa4ad0CE6"),
  deployBlock: Number(env("V1M_BASE_DEPLOY_BLOCK", "52632857")),
  swapAdapter: BASE_SWAP_ADAPTER,

  uniswap: {
    official: true,
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    swapRouter02: "0x2626664c2603336E57B271c5C0b26F421741e481",
    quoterV2: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    connectors: [WETH, USDC_BASE],
    feeTiers: [100, 500, 3000, 10000],
  },

  /* The pool's tokens (helpers/mainnet-tokens.js in the protocol repo), each
     checked before listing: a $5 round trip on Uniswap V3 keeps >= 97%, and
     transfers move exact amounts. Prices: stable = $1; the rest by a $1
     probe from ETH. */
  tokens: [
    { symbol: "ETH", name: "Ether", address: WETH, decimals: 18, native: true, wrapped: "WETH", logo: "/tokens/eth.png", popular: true },
    { symbol: "USDC", name: "USD Coin", address: USDC_BASE, decimals: 6, stable: true, logo: "/tokens/usdc.svg", popular: true },
    { symbol: "USDT", name: "Tether USD", address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6, stable: true, logo: "/tokens/base/usdt.png" },
    { symbol: "DAI", name: "Dai", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, stable: true, logo: "/tokens/base/dai.png" },
    { symbol: "USDS", name: "USDS", address: "0x820C137fa70C8691f0e44Dc420a5e53c168921Dc", decimals: 18, stable: true, logo: "/tokens/base/usds.png" },
    { symbol: "USDe", name: "Ethena USDe", address: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34", decimals: 18, stable: true, logo: "/tokens/usde.svg" },
    { symbol: "EURC", name: "Euro Coin", address: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42", decimals: 6, logo: "/tokens/base/eurc.png" },
    { symbol: "cbBTC", name: "Coinbase Wrapped BTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", decimals: 8, logo: "/tokens/cbbtc.svg", popular: true },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", decimals: 8, logo: "/tokens/wbtc.svg" },
    { symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, logo: "/tokens/base/cbeth.png" },
    { symbol: "wstETH", name: "Lido Wrapped stETH", address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", decimals: 18, logo: "/tokens/base/wsteth.png" },
    { symbol: "weETH", name: "ether.fi Wrapped eETH", address: "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A", decimals: 18, logo: "/tokens/base/weeth.png" },
    { symbol: "rETH", name: "Rocket Pool ETH", address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c", decimals: 18, logo: "/tokens/base/reth.png" },
    { symbol: "AERO", name: "Aerodrome", address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", decimals: 18, logo: "/tokens/base/aero.png", popular: true },
    { symbol: "VIRTUAL", name: "Virtuals Protocol", address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", decimals: 18, logo: "/tokens/base/virtual.png", popular: true },
    { symbol: "MORPHO", name: "Morpho", address: "0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842", decimals: 18, logo: "/tokens/base/morpho.png" },
    { symbol: "AAVE", name: "Aave", address: "0x63706e401c06ac8513145b7687A14804d17f814b", decimals: 18, logo: "/tokens/base/aave.png" },
    { symbol: "UNI", name: "Uniswap", address: "0xc3De830EA07524a0761646a6a4e4be0e114a3C83", decimals: 18, logo: "/tokens/base/uni.png" },
    { symbol: "LINK", name: "Chainlink", address: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196", decimals: 18, logo: "/tokens/base/link.png" },
    { symbol: "ZORA", name: "Zora", address: "0x1111111111166b7FE7bd91427724B487980aFc69", decimals: 18, logo: "/tokens/base/zora.png" },
    { symbol: "COMP", name: "Compound", address: "0x9e1028F5F1D5eDE59748FFceE5532509976840E0", decimals: 18, logo: "/tokens/base/comp.png" },
    { symbol: "CRV", name: "Curve DAO", address: "0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415", decimals: 18, logo: "/tokens/base/crv.png" },
    { symbol: "WELL", name: "Moonwell", address: "0xA88594D404727625A9437C3f886C7643872296AE", decimals: 18, logo: "/tokens/base/well.png" },
    { symbol: "VVV", name: "Venice Token", address: "0xacfE6019Ed1A7Dc6f7B508C02d1b04ec88cC21bf", decimals: 18, logo: "/tokens/base/vvv.png" },
    { symbol: "AIXBT", name: "aixbt", address: "0x4F9Fd6Be4a90f2620860d680c0d4d5Fb53d1A825", decimals: 18, logo: "/tokens/base/aixbt.png" },
    { symbol: "CLANKER", name: "Clanker", address: "0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb", decimals: 18, logo: "/tokens/base/clanker.png" },
    { symbol: "BNKR", name: "BankrCoin", address: "0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b", decimals: 18, logo: "/tokens/base/bnkr.png" },
    { symbol: "uSOL", name: "Solana (Universal)", address: "0x9B8Df6E244526ab5F6e6400d331DB28C8fdDdb55", decimals: 18, logo: "/tokens/base/usol.png" },
    { symbol: "cbXRP", name: "Coinbase Wrapped XRP", address: "0xcb585250f852C6c6bf90434AB21A00f02833a4af", decimals: 6, logo: "/tokens/base/cbxrp.png" },
    { symbol: "uDOGE", name: "Dogecoin (Universal)", address: "0x12E96C2BFEA6E835CF8Dd38a5834fa61Cf723736", decimals: 18, logo: "/tokens/base/udoge.png" },
    // memecoins
    { symbol: "BRETT", name: "Brett", address: "0x532f27101965dd16442E59d40670FaF5eBB142E4", decimals: 18, meme: true, logo: "/tokens/base/brett.png", popular: true },
    { symbol: "TOSHI", name: "Toshi", address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", decimals: 18, meme: true, logo: "/tokens/base/toshi.png" },
    { symbol: "DEGEN", name: "Degen", address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", decimals: 18, meme: true, logo: "/tokens/base/degen.png" },
    { symbol: "KEYCAT", name: "Keyboard Cat", address: "0x9a26F5433671751C3276a065f57e5a02D2817973", decimals: 18, meme: true, logo: "/tokens/base/keycat.png" },
    { symbol: "MIGGLES", name: "Mister Miggles", address: "0xB1a03EdA10342529bBF8EB700a06C60441fEf25d", decimals: 18, meme: true, logo: "/tokens/base/miggles.png" },
    { symbol: "SKI", name: "Ski Mask Dog", address: "0x768BE13e1680b5ebE0024C42c896E3dB59ec0149", decimals: 9, meme: true, logo: "/tokens/base/ski.png" },
    { symbol: "doginme", name: "doginme", address: "0x6921B130D297cc43754afba22e5EAc0FBf8Db75b", decimals: 18, meme: true, logo: "/tokens/base/doginme.png" },
    { symbol: "BENJI", name: "Basenji", address: "0xBC45647eA894030a4E9801Ec03479739FA2485F0", decimals: 18, meme: true, logo: "/tokens/base/benji.png" },
    { symbol: "TYBG", name: "Base God", address: "0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE", decimals: 18, meme: true, logo: "/tokens/base/tybg.png" },
    { symbol: "MOG", name: "Mog Coin", address: "0x2Da56AcB9Ea78330f947bD57C54119Debda7AF71", decimals: 18, meme: true, logo: "/tokens/base/mog.png" },
    { symbol: "PEPE", name: "Based Pepe", address: "0x52b492a33E447Cdb854c7FC19F1e57E8BfA1777D", decimals: 18, meme: true, logo: "/tokens/base/pepe.png" },
    { symbol: "TOBY", name: "Toby", address: "0xb8D98a102b0079B69FFbc760C8d857A31653e56e", decimals: 18, meme: true, logo: "/tokens/base/toby.png" },
    { symbol: "CAW", name: "Crow With Knife", address: "0xdfBEA88C4842d30c26669602888d746D30F9D60d", decimals: 18, meme: true, logo: "/tokens/base/caw.png" },
    { symbol: "HIGHER", name: "higher", address: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe", decimals: 18, meme: true, logo: "/tokens/base/higher.png" },
    { symbol: "DRB", name: "DebtReliefBot", address: "0x3ec2156D4c0A9CBdAB4a016633b7BcF6a8d68Ea2", decimals: 18, meme: true, logo: "/tokens/base/drb.png" },
    { symbol: "LAPTOP", name: "Laptop", address: "0xB095274743941e953c746F9C228DA9c18Bb6ec29", decimals: 18, meme: true, logo: "/tokens/base/laptop.png" },
    { symbol: "MOEW", name: "donotfomoew", address: "0x15aC90165f8B45A80534228BdCB124A011F62Fee", decimals: 18, meme: true, logo: "/tokens/base/moew.png" },
    { symbol: "RUSSELL", name: "Russell", address: "0x0C5142BC58f9A61AB8C3D2085DD2F4e550c5cE0B", decimals: 18, meme: true, logo: "/tokens/base/russell.png" },
    { symbol: "MOCHI", name: "Mochi", address: "0xF6e932Ca12afa26665dC4dDE7e27be02A7c02e50", decimals: 18, meme: true, logo: "/tokens/base/mochi.png" },
    { symbol: "NOICE", name: "noice", address: "0x9Cb41FD9dC6891BAe8187029461bfAADF6CC0C69", decimals: 18, meme: true, logo: "/tokens/base/noice.png" },
  ],

  fees: {
    ...FEE_POLICY,
    // the same contracts as Base Sepolia: its measured gas until live relays
    // replace it
    defaults: {
      transfer: { fixed: 130000, perCall: 910000 },
      withdraw: { fixed: 130000, perCall: 910000 },
      swap1: { fixed: 130000, perCall: 1110000 },
      swap2: { fixed: 130000, perCall: 1200000 },
    },
  },

  gas: { limitPct: 125, chargedOnLimit: false, l1DataFee: "op-stack" },

  priceSource: {
    rpcUrl: env("V1M_BASE_PRICE_RPC_URL", env("V1M_BASE_RPC_URL", "https://base-rpc.publicnode.com")),
    chainId: 8453,
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    wrappedNative: WETH,
    usdc: USDC_BASE,
    feeTiers: [500, 3000, 10000],
  },

  indexer: {
    logWindow: 1000,
    pollMs: Number(env("V1M_BASE_POLL_MS", "2000")),
  },

  reserveBalance: "0",
  reserveDelayBlocks: 0,
};

const freeze = (chain) =>
  Object.freeze({
    ...chain,
    callBytes: CALL_BYTES,
    tokens: Object.freeze(chain.tokens.map((t) => Object.freeze({ ...t }))),
    tokenByAddress: Object.freeze(Object.fromEntries(chain.tokens.map((t) => [t.address.toLowerCase(), t]))),
  });

const ALL_CHAINS = [MONAD_MAINNET, BASE_MAINNET, MONAD_TESTNET, BASE_SEPOLIA];

// V1M_CHAINS="monad,base" (the mainnet server) or "monad-testnet,base-sepolia";
// by default every chain that has a pool address
const wanted = env("V1M_CHAINS", "")
  .split(",")
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean);
const unknown = wanted.filter((id) => !ALL_CHAINS.some((c) => c.id === id));
if (unknown.length) throw new Error(`V1M_CHAINS: unknown chain(s) ${unknown.join(", ")}`);

export const CHAINS = Object.freeze(
  ALL_CHAINS.filter((c) => (wanted.length ? wanted.includes(c.id) : true))
    .filter((c) => {
      if (c.pool) return true;
      if (wanted.includes(c.id)) throw new Error(`${c.name} has no pool address yet (set V1M_MONAD_POOL)`);
      return false; // not deployed yet: left out
    })
    .map(freeze)
);
if (!CHAINS.length) throw new Error("no chains to run: check V1M_CHAINS");

// the chain the app opens on (and the old single-chain routes answer for):
// the mainnet when this server runs one
export const DEFAULT_CHAIN = CHAINS.find((c) => c.keyNetwork === "mainnet") || CHAINS[0];

/* On demand (Vercel), where nothing runs between requests: how the indexers
   catch up (routes.js). UptimeRobot calls /api/v1m/catch-up every 5 minutes. */
export const SYNC = Object.freeze({
  // /catch-up: each chain catches up for this long before the answer
  budgetMs: Number(env("V1M_SYNC_BUDGET_MS", "20000")),
  // a chain still behind keeps going after the answer (under Vercel's 300 s)
  backgroundBudgetMs: Number(env("V1M_BACKGROUND_BUDGET_MS", "240000")),
  // the app's /sync and /status catch up first when the copy is older than this...
  staleMs: Number(env("V1M_STALE_MS", "15000")),
  // ...for at most this long
  requestBudgetMs: Number(env("V1M_REQUEST_BUDGET_MS", "8000")),
});

/** A chain by its id ("base-sepolia") or chain id (84532); null if unknown. */
export function chainFor(key) {
  const text = String(key ?? "").toLowerCase();
  return CHAINS.find((c) => c.id === text || String(c.chainId) === text) || null;
}

export function tokenInfo(chain, address) {
  return chain.tokenByAddress[String(address).toLowerCase()] || null;
}

/** What the website shows in its chain switcher and needs to add the chain to a wallet. */
export function publicChain(chain) {
  return {
    id: chain.id,
    name: chain.name,
    shortName: chain.shortName,
    chainId: chain.chainId,
    keyNetwork: chain.keyNetwork,
    nativeSymbol: chain.nativeSymbol,
    nativeName: chain.nativeName,
    rpcUrl: chain.publicRpcUrl,
    explorer: chain.explorer,
    // which proving keys the browser uses: the development setup on testnets,
    // the ceremony's on mainnets (website/public/zk/v1m/mainnet)
    provingKeys: chain.keyNetwork === "mainnet" ? "mainnet" : "testnet",
  };
}
