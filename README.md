# 🌑 Menoid
The compliance-friendly multichain privacy layer.

## ✨ Introduction
Menoid is a compliance-friendly multichain privacy layer, targeting 15+ chains.

- **V1 — live on mainnet.** The private app runs in the browser at [app.menoid.xyz](https://app.menoid.xyz), on **Monad** and **Base**: mask, send, swap and unmask privately, and share a viewing key whenever you need to prove your activity. Testnets: [testnet.menoid.xyz](https://testnet.menoid.xyz).
- **V0.5 — the older demo.** The browser extension and the Android app, with Open Mode and Noid Mode, on 6 testnets.

Menoid enables users to:

🕶️ Mask, send, swap and unmask privately — no address on-chain, no link between payments
🔍 Share a viewing key to prove their activity — read-only, so it can never spend
🌍 Use both Public Mode and Noid Mode depending on how visible they want to be on-chain (V0.5)
🛡️ Maintain privacy while remaining fully composable with multi-chain protocols

## 🎬 Demo

![Menoid V1 — a private swap on Monad mainnet](demo/09-swap.png)

One real session on Monad mainnet, step by step — connect, register, mask, send, swap, unmask, your account and viewing keys: **[see the demo →](demo.md)**

## ⚙️ Tech Stack
### 🧠 Zero Knowledge
- Circom
- SnarkJS
- Groth16
- Poseidon commitments


### ⛓️ Smart Contracts
- Solidity
- Anchor
- Move
- Hardhat
- OpenZeppelin

### 🌐 Wallet & Frontend
- Next.js / React
- Vite
- Chrome Extension APIs
- CRXJS

### 🔗 Blockchain
- 15+ Chains (Monad, Base, Arbitrum, Optimism, Polygon, Solana, Avalanche, Sui, Aptos, Linea, Scroll, Mantle, Berachain, Ethereum, and more)
- Parallel EVM & EVM Compatible Architecture

## 🚧 Current Building Status
### ✅ Completed
- 🌑 Private wallet Architecture
- 🔑 Deterministic wallet derivation
- 🧮 Poseidon commitment system
- 🚫 Nullifier-based double spend prevention
- 🌳 Incremental Merkle Tree integration
- 🔐 Encrypted on-chain note transfers
- 📡 Relayer-based transaction broadcasting
- ⚖️ zk balance conservation logic

*Fully implemented, tested, and demonstrated through the PriFi web application: https://pri-fi.vercel.app*

#### 💰 Deposit System
- 🌳 Commitment generation
- 🔐 Encrypted note creation
- 🔒 zk deposit proof system
- 📡 Relayer fee note architecture
- ⛓️ On-chain commitment insertion

#### 🔒 Transfer System
- 👤 Private peer-to-peer transfers
- 🌳 Merkle inclusion verification
- 🚫 Nullifier validation
- 🔐 Encrypted ownership transfers
- ⚖️ Batched balance conservation
- 🧩 Fixed-size circuit architecture

#### 💸 Withdraw System
- 💰 Shielded withdrawals
- 🔄 Change note generation
- 📡 Relayer fee handling
- 🔒 zk withdrawal proof system
- ⛓️ On-chain nullifier tracking

#### 🌐 Infrastructure
- 📜 Solidity smart contracts
- ⚡ Circom zk circuits
- 📡 Relayer architecture
- 🖥️ Frontend application
- 🧪 Multi-chain testnet deployment

### ⚙️ Currently Building
#### 👻 Private Execution Infrastructure
- 🧠 Private smart account abstraction (Noid Account)
- 🌐 Private protocol interaction system
- 📜 Arbitrary smart contract execution
- 🔄 zk-authorized execution accounts
- 🔐 Private execution infrastructure for 15+ chains

#### 🌑 Menoid Wallet
- 🖥️ Complete browser wallet extension
- 📚 Wallet integration libraries (dev SDKs)
- 🔗 Multi-chain wallet provider injection



Users should be able to:
- 🌍 Switch seamlessly between Public Mode and Noid Mode
- 👻 Become ghosts onchain when privacy is needed
- 🔐 Interact with protocols privately through Noid infrastructure
- 🧠 Execute interactions through zk-authorized smart accounts
- 🔐 Hold assets privately while remaining fully composable with multi-chain protocols

## 🌐 Private Execution Layer
Menoid introduces a private execution architecture where users interact with protocols through private smart execution accounts called Noid Smart Accounts (Unlinkable pseudonymous execution).

Instead of directly exposing wallet activity publicly, Menoid abstracts:
- 👤 User identity
- 🔗 Protocol interaction relationships
- 📜 Smart contract execution ownership
- 🌊 DeFi activity correlations
through zk-based execution authorization.

The goal is to make:
- 🔄 Private swaps
- 🌊 Stealth liquidity positions
- 🏦 Invisible lending strategies
- 📜 Private smart contract interactions
- 🕶️ Hidden on-chain activity
feel native across 15+ chains.

## 🖥️ Wallet Ecosystem
Menoid is being designed as a complete AI-native smart wallet infrastructure.

The ecosystem direction includes:
- 🌑 Browser wallet extension
- ⚡ Sidebar-first wallet architecture
- 🤖 Integrated AI companion called Meno across the wallet experience
- 📚 Developer SDKs & integration libraries
- 🔗 Wallet-provider injection system
- 🧩 Smart account infrastructure
- 📡 Relayer-powered private execution
- 🛡️ zk-authorized transaction flows
- 📰 Menews — integrated crypto ecosystem updates by Meno
- ⏰ Secure scheduled transfers, swaps, purchases, and automated actions
- 🔎 AI-powered protocol, NFT, and token discovery infrastructure

The goal is to provide a wallet experience where privacy and AI become integrated primitives — not additional tools.
