import Link from "next/link";

import DownloadV05 from "./DownloadV05";
import {
  Bullets,
  C,
  Callout,
  Deeper,
  DocHero,
  Example,
  Facts,
  Fields,
  Flow,
  Formula,
  FormulaCard,
  H3,
  KeyTree,
  Label,
  Lead,
  LIT_INK,
  P,
  Steps,
  Table,
  Visibility,
} from "./kit";

/* ────────────────────────────────────────────────────────────
   V0.5 Testnet — the wallet extension + Android app, written
   from the protocol write-up in the docs repo (DOCS.md) and the
   V0.5 contracts and circuits. Called "V1" in that repo; it was
   renamed V0.5 when the mainnet web app became V1.
   ──────────────────────────────────────────────────────────── */

export function V05Hero() {
  return (
    <DocHero
      eyebrow="Menoid docs · V0.5 Testnet"
      title="Menoid V0.5"
      lede="The first Menoid: a self-custodial wallet — a browser extension and an Android app — with two modes, Open and Noid, on six testnets. It proved the idea: the same private pool and the same keys, on every kind of chain."
      chips={[{ label: "Browser extension", live: true }, { label: "Android app", live: true }, { label: "6 testnets" }, { label: "Test tokens only" }]}
    >
      <DownloadV05
        className="rounded-full px-5 py-2.5 font-round text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5"
        style={{ background: LIT_INK, boxShadow: "0 10px 24px -10px rgba(59,37,112,0.7)" }}
      >
        Download V0.5
      </DownloadV05>
      <Link href="/docs" className="rounded-full px-4 py-2.5 font-round text-[14px] font-semibold text-[#3B2570] transition-colors hover:bg-[rgba(78,47,142,0.08)]">
        Looking for mainnet? V1 docs →
      </Link>
    </DocHero>
  );
}

function WhatIsV05() {
  return (
    <>
      <Lead>
        Menoid V0.5 is a complete wallet, not a web app: you create it with a 12-word recovery phrase, and it keeps your keys on your device behind a password. One wallet, one
        address, two modes — <strong>Open</strong> for everyday public use, <strong>Noid</strong> for privacy. It runs on six testnets, so everything here moves test tokens
        only.
      </Lead>

      <Label>Two modes, one wallet</Label>
      <Table
        head={["", "Open mode", "Noid mode"]}
        rows={[
          ["Balances", "Public — anyone can read them", "Hidden"],
          ["Transfers", "Ordinary public transfers", "Private sends"],
          ["History", "Traceable on any explorer", "Unlinkable on-chain"],
          ["Address", "Your one address", "The same address — no second one"],
          ["The look", "A clear lilac sky", "The same sky after dark, with rain"],
        ]}
      />
      <P>
        Moving between the modes is a transaction, not a migration: <strong>Mask</strong> (a deposit) moves public coins into the pool, <strong>Unmask</strong> (a withdraw)
        moves them back. Inside Noid mode, <strong>Send</strong> (a transfer) pays anyone privately — the extension calls these Mask, Send and Unmask; the contracts call them
        deposit, transfer and withdraw.
      </P>

      <Label>Where it runs</Label>
      <Table
        head={["Chain", "Network", "Built with"]}
        rows={[
          ["Monad", "testnet (10143)", "Solidity · Hardhat"],
          ["Ethereum Sepolia", "testnet (11155111)", "Solidity · Hardhat"],
          ["Base Sepolia", "testnet (84532)", "Solidity · Hardhat"],
          ["Solana", "devnet", "Rust · Anchor"],
          ["Sui", "testnet", "Move"],
          ["Aptos", "testnet", <>Move — plus a fourth circuit (see <Link href="/docs/v0.5/mask" className="font-semibold text-[#C9B0FF] underline decoration-[#C9B0FF]/40 underline-offset-4 hover:text-white">Mask</Link>)</>],
        ]}
      />
      <P>
        Four codebases, one protocol. The circuits and every formula are identical on all six; what differs is how each chain verifies a Groth16 proof and stores its Merkle
        tree.
      </P>

      <Label>How the pieces fit</Label>
      <Flow
        nodes={[
          { icon: "puzzle", title: "Menoid wallet", lines: ["extension or Android", "keys · proofs · decryption"] },
          { icon: "relayer", title: "Relayer", lines: ["submits private txs", "pays their gas"] },
          { icon: "pool", title: "NoidPool", lines: ["one per chain", "verifies · holds coins"] },
        ]}
        edges={["proofs + encrypted notes", "transactions"]}
        caption="Masks go straight from your address to the pool; sends and unmasks go through the relayer, so your address never touches them."
      />
      <Visibility
        seen={["That an address enabled Noid mode", "Mask amounts and the depositing address", "Unmask amounts and the receiving address", "Commitments, nullifiers, roots and encrypted notes"]}
        hidden={["Your spending key", "What each note holds, and who owns it", "Sender, receiver and amount of every send", "The link between a mask and an unmask"]}
      />
    </>
  );
}

function KeyDerivation() {
  return (
    <>
      <Lead>
        Noid mode doesn’t create a second wallet. Your wallet signs one fixed message, <strong>menoid_Wallet</strong>, and a deterministic “wallet generator” turns that
        signature into two key pairs. Same wallet, same signature, same keys — on every device and every chain.
      </Lead>
      <KeyTree
        root={[{ code: 'signature = sign("menoid_Wallet")', edge: "the wallet generator" }]}
        columns={[
          { title: "Spending key pair", icon: "key", rows: ['sk = H("menoid/spend", signature) mod l', "spendPk = sk · Base8"], note: "BabyJubJub — proves ownership inside a proof." },
          { title: "Encryption key pair", icon: "lock", rows: ['encPriv = H("menoid/encryption", signature)', "encPub = encPriv · G"], note: "Encrypts and decrypts note contents (ECIES)." },
        ]}
        merge={{ edge: "spendPk + your address", code: "userCommitment = Poseidon(address, spendPk.x, spendPk.y)", note: "Your Noid identity — registered on-chain together with encPub." }}
      />
      <Formula
        label="Exactly"
        code={`signature      = sign("menoid_Wallet")                       // no gas, touches no chain
sk             = keccak256("menoid/spend" ‖ signature) mod l   // BabyJubJub scalar
spendPk        = sk · Base8                                   // BabyJubJub point (x, y)
encPriv        = keccak256("menoid/encryption" ‖ signature)
encPub         = encPriv · G                                  // secp256k1, 65 bytes on EVM
userCommitment = Poseidon(address, spendPk.x, spendPk.y)`}
        caption="l is BabyJubJub’s prime subgroup order. The two tags make the keys independent — learning one tells you nothing about the other. On Solana, Sui and Aptos the registered encryption key is a 32-byte ed25519 key instead."
      />

      <Label>Each field, and why</Label>
      <Fields
        rows={[
          ["message", "The fixed string menoid_Wallet.", "Constant, so the same wallet always produces the same signature — which lets the signature act as a seed."],
          ["signature", "Your wallet’s signature over it. Free: no transaction.", "The one secret every key comes from."],
          ["sk", "keccak256 of a tag and the signature, mod l.", "The spending key. It proves you own notes inside a proof, and it goes into every nullifier."],
          ["spendPk", "sk · Base8 on BabyJubJub.", "BabyJubJub lives in the proofs’ own field, so a circuit can rebuild spendPk from sk cheaply."],
          ["encPriv · encPub", "A second key pair, from a second tag.", "Seals note contents so only you can read them. encPub is registered so senders can encrypt to you."],
          ["userCommitment", "Poseidon(address, spendPk.x, spendPk.y).", "Your Noid identity: your real address (so people pay your normal address) plus your spending key (so only you can spend)."],
        ]}
      />

      <H3>Why two key pairs</H3>
      <Table
        head={["", "Spending", "Encryption"]}
        rows={[
          ["Curve", "BabyJubJub", "secp256k1 (EVM)"],
          ["Job", "Prove ownership inside a proof; make nullifiers", "Encrypt and decrypt note contents"],
          ["Lives in", "The circuit’s arithmetic", "Ordinary software"],
          ["An on-chain account?", "No", "No"],
        ]}
      />

      <H3>Why derive from a signature</H3>
      <Bullets
        items={[
          <>
            <strong>No second address.</strong> Earlier designs made a separate “noid wallet”, and people reasonably thought they had two wallets. Now there is only your real
            address.
          </>,
          <>
            <strong>No second seed phrase.</strong> Nothing extra to back up.
          </>,
          <>
            <strong>Recovery for free.</strong> Sign menoid_Wallet again on a new device and the same keys come back; your notes are rebuilt from chain events alone.
          </>,
          <>
            <strong>One identity everywhere.</strong> The same derivation runs on EVM, Solana, Aptos and Sui.
          </>,
        ]}
      />
      <Example>
        Same wallet, two devices: the extension on your laptop and the Android app both sign menoid_Wallet with the same key, get the same signature — and so the same sk,
        encPriv and userCommitment. Both show the same private balance.
      </Example>
      <Callout tone="warn" title="The signature is the master secret">
        Anyone who obtains the menoid_Wallet signature can derive both key pairs and spend every note you own. The wallet never transmits it. (V1’s message names the site and
        the network for exactly this reason — see{" "}
        <Link href="/docs/v0.5/what-changed" className="font-semibold text-[#C9B0FF] underline decoration-[#C9B0FF]/40 underline-offset-4 hover:text-white">
          From V0.5 to V1
        </Link>
        .)
      </Callout>
    </>
  );
}

function Formulas() {
  return (
    <>
      <Lead>
        V0.5 keeps no balances. Value lives as <strong>notes</strong>, in the style of Bitcoin’s UTXOs: an amount and a random number, owned by a userCommitment and spent
        whole. Each pool holds one coin — its chain’s native one.
      </Lead>
      <Example title="Example: a note is spent whole">
        You hold one 10 MON note and send 4 MON with a 0.01 MON fee. The note is consumed entirely: 4 MON to the receiver, 5.99 MON change back to you, 0.01 MON to the relayer —
        10 in, 10 out. Your balance is simply the sum of your unspent notes, and only your wallet can compute it.
      </Example>

      <FormulaCard
        symbol="uc"
        name="userCommitment — your Noid identity"
        code="userCommitment = Poseidon(address, spendPk.x, spendPk.y)"
        what="One field element binding your real address to your spending key."
        why="It contains your address, so a sender just types your normal address and reads your commitment from the pool. It contains spendPk, so knowing your address isn’t enough to spend — that takes sk."
        used="Registration, every note you own, and every proof — the circuit rebuilds it from sk and your address."
        example="Bob pays Alice by typing her ordinary address. His wallet reads her registration on-chain and locks the new note to her userCommitment. No special private address is ever exchanged."
      />
      <FormulaCard
        symbol="cm"
        name="commitment — the note on-chain"
        code={`r          = a fresh random number          // never reused
commitment = Poseidon(1, amount, r, userCommitment)`}
        what="A note’s public fingerprint: one leaf of the pool’s Merkle tree. It reveals neither the amount nor the owner."
        why="r makes it hiding: without it, every 1 MON note to the same person would hash to the same value and could be guessed by trying amounts. The leading 1 is a domain separator."
        used="Created by every mask, send and unmask; proved to exist when the note is spent."
        example="You mask 4 MON: C = Poseidon(1, 4·10¹⁸, r, uc). The chain stores C — nobody can tell it holds 4 MON, or that it is yours."
      />
      <FormulaCard
        symbol="nf"
        name="nullifier — the note’s spent marker"
        code="nullifier = Poseidon(2, commitment, r, sk)"
        what="A number published when a note is spent."
        why="The pool refuses a nullifier it has already seen, so no note is spent twice. It needs sk, so only the owner can make one — and nobody can link it back to its commitment."
        used="Every send and unmask: one per input note."
        example="You spend the 4 MON note and the proof publishes N. A second spend with N fails: the nullifier is already spent."
      />
      <FormulaCard
        symbol="root"
        name="Merkle root — proof that a note exists"
        code={`root = top of a depth-20 incremental Merkle tree   // 1,048,576 leaves per pool
// a full pool opens a new one; each pool keeps its last 10 roots`}
        what="One number summarising every commitment in a pool."
        why="Proving a note sits under the root proves it exists without saying which leaf it is. Ten remembered roots let a proof made a moment ago survive other people’s transactions."
        used="Every send and unmask."
        example="You prove against root R and two deposits land before your transaction. R is still among the last 10 roots, so it is accepted. Wait too long and you simply prove again."
      />
      <FormulaCard
        symbol="enc"
        name="encrypted note — how the owner finds it"
        code="encryptedNote = ECIES(owner’s encPub, { amount, r })"
        what="A note’s contents sealed to its owner, emitted in the NoteCreated event."
        why="Nothing on-chain says whose a note is. Only the owner’s encPriv opens it."
        used="Every note created — the relayer’s fee notes included."
        example="Alice’s wallet tries every new note with her encPriv. Most fail (not hers); one opens to {2 MON, r}. She rebuilds Poseidon(1, 2·10¹⁸, r, uc_A), it matches — +2 MON."
      />
    </>
  );
}

function Registration() {
  return (
    <>
      <Lead>
        Registration gives your Open-mode wallet a Noid identity: one transaction per chain, from your real address, storing your userCommitment and your encryption public key.
        In the wallet you switch to Noid, pick the funded chains, and tap Register.
      </Lead>
      <Facts
        items={[
          ["Sent by", "Your wallet"],
          ["Proof", "None"],
          ["Gas", "Paid by you"],
          ["Stores", "userCommitment + encPub"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "pen", title: "Your wallet", lines: ["signs menoid_Wallet", "no gas"] },
          { icon: "puzzle", title: "Wallet generator", lines: ["sk · spendPk", "encPriv · encPub"] },
          { icon: "wallet", title: "Your address", lines: ["sends register()", "one transaction"] },
          { icon: "pool", title: "NoidPool", lines: ["stores it", "once, for good"] },
        ]}
        edges={["signature", "uc + encPub", "transaction"]}
      />
      <Steps
        groups={[
          {
            where: "In the wallet",
            icon: "puzzle",
            note: "on your device",
            items: [
              "Signs menoid_Wallet — a signature, not a transaction.",
              "Derives the two key pairs and your userCommitment.",
              <>
                Sends <C>register(userCommitment, encryptionPublicKey)</C> from your real address.
              </>,
            ],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Requires a non-zero userCommitment, and an encryption key of 65 bytes starting with 0x04 (on EVM).",
              "Requires the address isn’t registered yet — registering is one-time and permanent; nobody, you included, can re-point an address later.",
              <>
                Stores <C>registered[you] = userCommitment</C> and <C>encryptionKeys[you] = encPub</C>, and emits <C>WalletRegistered</C>.
              </>,
            ],
          },
        ]}
      />
      <P>
        <strong>The relayer registers too</strong>, when the pool is deployed: its commitment is stored as the immutable relayerCommitment, and every circuit is bound to it.
      </P>

      <H3>Why the encryption key goes on-chain too</H3>
      <P>
        A sender needs two things: your userCommitment, to lock the note to you, and your encryption key, to seal it so only you can read it. The commitment is a hash — the key
        can’t be recovered from it. When only the commitment was on-chain, the key lived in a server’s database, and a missed lookup made a registered wallet look unregistered,
        so the sender fell back to a public withdraw. A privacy wallet must never send in the clear by accident — so both now come from one on-chain read:
      </P>
      <Table
        head={["Chain", "Read"]}
        mono={[1]}
        rows={[
          ["EVM", "registrationOf(address) → (bytes32, bytes)"],
          ["Aptos", "pool::registration_of(pool, addr) → (bool, u256, vector<u8>)"],
          ["Sui", "pool::registration_of(state, addr) → (bool, u256, vector<u8>)"],
          ["Solana", "the Registration PDA, which holds both"],
        ]}
      />
      <P>An address that never registered answers (false, 0, empty) instead of reverting, so “not registered” is never confused with “the node didn’t answer”.</P>
      <Visibility seen={["That this address enabled Noid mode", "Its userCommitment and encryption public key"]} hidden={["Your spending and encryption private keys", "Your balance and activity"]} />
    </>
  );
}

function Mask() {
  return (
    <>
      <Lead>
        Masking is the door from Open mode into Noid mode: public coins go into the pool and become private notes. In V0.5 the wallet proves the deposit itself, and can pre-pay
        the relayer with a fee note in the same step.
      </Lead>
      <Facts
        items={[
          ["Sent by", "Your wallet"],
          ["Proof", "deposit (5 signals)"],
          ["Gas", "Paid by you"],
          ["Creates", "1 or 2 notes"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "puzzle", title: "Noid mode", lines: ["builds C1 and C2", "proves the deposit"] },
          { icon: "wallet", title: "Your address", lines: ["sends deposit()", "with the coins"] },
          { icon: "pool", title: "NoidPool", lines: ["verifies the proof", "inserts the notes"] },
        ]}
        edges={["proof + 2 notes", "coins + transaction"]}
        caption="No relayer: a mask is public by nature — the chain sees your address send the coins."
      />
      <Steps
        groups={[
          {
            where: "In the wallet",
            icon: "puzzle",
            items: [
              "You choose the amount a and, optionally, a relayer fee f.",
              "Picks fresh randomness r1, r2, and reads your uc (registered[you]) and the relayer’s rc from the pool.",
              "C1 = Poseidon(1, a − f, r1, uc) is your note; C2 = Poseidon(1, f, r2, rc) is the relayer’s fee note.",
              "Encrypts {a − f, r1} to your encPub and {f, r2} to the relayer’s.",
              "Proves (a − f) + f = a — about 20 seconds in the extension.",
            ],
          },
          {
            where: "Your address",
            icon: "wallet",
            items: [
              <>
                Sends <C>deposit(proof, C1, C2, encryptedNote1, encryptedNote2)</C> with the a coins attached.
              </>,
            ],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Requires coins attached and a non-zero C1; refuses a commitment that already exists (“change r value”).",
              "Sets c2Enabled from whether C2 is zero.",
              "Builds the 5 public signals itself — injecting its own relayerCommitment — and verifies the proof.",
              "Inserts the commitments into the current pool’s tree, pushes one new root, and emits NoteCreated for each.",
              "The coins simply stay in the contract; from here on, ownership is tracked by commitments alone.",
            ],
          },
        ]}
      />

      <H3>What the deposit proof proves</H3>
      <Formula
        label="Circuit, simplified"
        code={`c1 === Poseidon(1, a1, r1, uc1)                        // your note commits to (a1, r1, uc1)
c2_enabled · (c2 − Poseidon(1, a2, r2, uc2)) === 0     // the fee note — only if enabled
c2_enabled · (1 − c2_enabled) === 0                    // c2_enabled is 0 or 1
depositAmount === a1 + c2_enabled · a2                 // nothing created, nothing lost`}
      />
      <Table
        head={["#", "Public signal", "Meaning"]}
        mono={[1]}
        rows={[
          ["0", "depositAmount", "msg.value — the public amount"],
          ["1", "c1", "your commitment"],
          ["2", "c2", "the relayer’s fee commitment (0 if none)"],
          ["3", "c2_enabled", "1 if the fee note exists, else 0"],
          ["4", "uc2", "the relayer’s commitment — supplied by the contract"],
        ]}
      />
      <Bullets
        items={[
          "uc2 is public and comes from the contract, so a fee note can’t be pointed anywhere but the relayer.",
          "uc1 is private and unconstrained — which is exactly what lets you deposit straight to someone else.",
          "No fee note? Pass C2 = 0: the circuit zeroes the fee, depositAmount must equal a1, and one NoteCreated is emitted instead of two.",
        ]}
      />

      <H3>The Merkle tree</H3>
      <P>
        Each pool is an incremental Merkle tree of depth 20 — 1,048,576 leaves — and when one fills, the contract opens the next. Appending costs 20 hashes up a single path,
        thanks to <C>filledSubtrees</C> (the latest left node at each level), and a batch pushes one root, not one per leaf. Each pool remembers its last 10 roots.
      </P>
      <Deeper title="The Aptos exception — the tree updates in a second step">
        <P>
          Aptos verifies Groth16 in pure Move, and proof verification plus a Merkle insertion runs past its execution limit. So on Aptos, mask, send and unmask only{" "}
          <strong>queue</strong> their commitments, and <C>pool::update_root</C> then inserts each one with a fourth circuit, <strong>new_root</strong>, which proves the new
          root follows from the old one.
        </P>
        <Formula
          label="new_root"
          code={`public inputs : oldSubtreesHash, commitment, leafIndex
public outputs: newRoot, newSubtreesHash
private       : oldSubtrees[20]            // the relayer's copy of filled_subtrees`}
        />
        <P>
          The pool refuses new operations while anything is queued — a proof against a root that is about to change would prove against state that never existed — and the
          relayer drains the queue as part of the normal flow. Everything else is identical: an Aptos note is the same object as a Monad note, it just becomes spendable one
          transaction later.
        </P>
      </Deeper>
      <Visibility
        seen={["Your address, the total amount, and when"]}
        hidden={["How the amount splits between your note and the fee note", "When your note is spent, and where its value goes"]}
      />
    </>
  );
}

function Send() {
  return (
    <>
      <Lead>
        A private send moves value between Noid users entirely inside the pool — no coins enter or leave, and neither side is revealed. You paste an ordinary address; the wallet
        finds its Noid identity on-chain.
      </Lead>
      <Facts
        items={[
          ["Sent by", "The relayer"],
          ["Proof", "transfer (19 signals)"],
          ["Fee", "A private note"],
          ["Notes", "up to 4 in → 3 out"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "puzzle", title: "Menoid wallet", lines: ["gathers notes", "proves the transfer"] },
          { icon: "relayer", title: "Relayer", lines: ["validates locally", "submits, pays gas"] },
          { icon: "pool", title: "NoidPool", lines: ["verifies · nullifies", "inserts new notes"] },
          { icon: "person", title: "Receiver", lines: ["finds the note", "by trial decryption"] },
        ]}
        edges={["Transfer Calls", "transfer()", "NoteCreated"]}
      />
      <Steps
        groups={[
          {
            where: "In the wallet",
            icon: "puzzle",
            items: [
              "Resolves the receiver’s address to their userCommitment and encryption key, from the chain.",
              "Gathers unspent notes until they cover amount + fee.",
              "Batches them into groups of at most 4 — the circuit’s fixed input width.",
              "Builds up to 3 outputs per batch: C1 to the receiver, C2 your change, C3 the relayer’s fee.",
              "For each input, fetches its Merkle path and computes its nullifier. Unused slots are switched off with the enabled[] mask.",
              "Proves each batch and hands the Transfer Calls — public signals, nullifiers, proof, output commitments, encrypted notes — to the relayer.",
            ],
          },
          {
            where: "At the relayer",
            icon: "relayer",
            note: "gate 1 — the relayer protecting itself",
            items: [
              "Checks each call, validates the proofs off-chain, and checks the fee is worth it. Invalid or unprofitable → rejected, before any gas is spent.",
              "Submits transfer(calls) and pays the gas.",
            ],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            note: "gate 2 — the real one",
            items: [
              "enabled[] is boolean, each pool exists, each root is among its pool’s last 10, and each nullifier is unspent and unique within the call.",
              "Rejects duplicate output commitments, builds the 19 public signals — injecting its own relayerCommitment — and verifies each proof.",
              "Marks every nullifier spent, inserts the new commitments, and emits NoteCreated for each.",
            ],
          },
          {
            where: "On the receiver’s side",
            icon: "person",
            items: ["Their wallet finds the new note by trial decryption. Nothing announces the payment — they simply find it."],
          },
        ]}
      />

      <H3>Batches that build on each other</H3>
      <P>
        Several Transfer Calls run atomically in one transaction, and a later call may spend a note that an earlier call created in that same transaction. That is note
        aggregation: fold 4 notes into 1, feed it into the next call with 3 more, and so on — large payments without ever widening the circuit. And since a 1-input and a
        4-input transfer produce identically shaped proofs, the proof never leaks how many notes you spent.
      </P>

      <H3>What the proof proves</H3>
      <Bullets
        items={[
          <>
            <strong>You own the notes:</strong> sk → spendPk → userCommitment with your address, and every enabled input is built from it.
          </>,
          <>
            <strong>They exist:</strong> each enabled input’s Merkle path leads to a root the pool accepts.
          </>,
          <>
            <strong>The nullifiers are right:</strong> each is Poseidon(2, commitment, r, sk) — only the owner can make one.
          </>,
          <>
            <strong>The outputs are well-formed</strong> and locked to the intended owners.
          </>,
          <>
            <strong>Nothing is created:</strong> every amount is range-checked below 2¹²⁸, and the inputs sum to the outputs.
          </>,
          <>
            <strong>The relayer is paid:</strong> the third output must belong to the relayer’s commitment.
          </>,
        ]}
      />
      <Callout title="Why the range checks matter">
        Proof arithmetic wraps around a huge prime. Without a bound, an output could be a giant number that wraps around and still balances the sum — value from nothing.
        RangeCheck(128) splits every amount into 128 bits, so it can’t happen.
      </Callout>
      <Deeper title="The 19 public signals">
        <Table
          head={["Index", "Signal", "Count"]}
          mono={[1]}
          rows={[
            ["0", "relayerCommitment", "1"],
            ["1–4", "enabled[]", "4"],
            ["5–8", "roots[]", "4"],
            ["9–12", "nullifiers[]", "4"],
            ["13–15", "output_enabled[]", "3"],
            ["16–18", "c_outs[]", "3"],
          ]}
        />
        <P>Everything else — sk, your address, the input commitments, every amount and random number, the Merkle paths, and the receivers — is private.</P>
      </Deeper>
      <Visibility
        seen={["That a transfer happened", "Nullifiers and new commitments", "The relayer as the sender"]}
        hidden={["Sender and receiver", "The amounts", "Which notes were spent"]}
      />
    </>
  );
}

function Unmask() {
  return (
    <>
      <Lead>
        Unmasking is the door back out: notes are spent and real coins go to a public address. Structurally it is a transfer with one output sent to the public world instead of
        into a note.
      </Lead>
      <Facts
        items={[
          ["Sent by", "The relayer"],
          ["Proof", "withdraw (19 signals)"],
          ["Pays to", "Any address"],
          ["Notes", "up to 4 in → 2 out"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "puzzle", title: "Menoid wallet", lines: ["gathers notes", "proves the withdraw"] },
          { icon: "relayer", title: "Relayer", lines: ["validates", "submits"] },
          { icon: "pool", title: "NoidPool", lines: ["verifies · nullifies", "pays once, at the end"] },
          { icon: "globe", title: "Receiving address", lines: ["gets the coins", "publicly"] },
        ]}
        edges={["Withdraw Calls", "withdraw(…, to)", "coins"]}
      />
      <Table
        head={["", "Send (transfer)", "Unmask (withdraw)"]}
        rows={[
          ["Outputs", "3 notes: receiver, change, relayer", "2 notes: change, relayer — plus a public payout"],
          ["Public signals", "19", "19, including receiver and withdrawAmount"],
          ["Balance rule", "Σ in = Σ out", "Σ in = Σ out + withdrawAmount"],
          ["Coins move?", "No", "Yes — out of the pool"],
          ["Receiver", "Private", "Public address and amount"],
        ]}
      />
      <Steps
        groups={[
          {
            where: "In the wallet",
            icon: "puzzle",
            items: [
              "You choose the amount and the receiving address — a flat relayer fee applies.",
              "Gathers and batches notes (at most 4 per proof); each batch’s outputs are your change and the relayer’s fee.",
              "Proves every batch for that one destination.",
            ],
          },
          {
            where: "At the relayer",
            icon: "relayer",
            items: ["Validates the calls and submits withdraw(calls, to)."],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "For each call: checks the inputs, rejects duplicate commitments, builds the 19 public signals with publicSignals[0] = the to address, and verifies the proof.",
              "Marks the nullifiers spent, inserts the change and fee commitments, and emits NoteCreated.",
              "Sends the total to the address once, at the end — one transfer for the whole batch. Any failure reverts everything: no partial withdrawals.",
            ],
          },
        ]}
      />
      <H3>The destination is bound into the proof</H3>
      <Formula label="On-chain" code="publicSignals[0] = uint256(uint160(to))     // the contract feeds the destination into the proof" />
      <P>
        The proof was made for one destination. A relayer that redirects the payout changes publicSignals[0], and verification fails. The relayer is a courier, not a custodian:
        it can deliver the withdrawal or drop it, never re-address it.
      </P>
      <Deeper title="The 19 public signals">
        <Table
          head={["Index", "Signal", "Count"]}
          mono={[1]}
          rows={[
            ["0", "receiver (the destination address)", "1"],
            ["1", "relayerCommitment", "1"],
            ["2–5", "enabled[]", "4"],
            ["6–9", "roots[]", "4"],
            ["10–13", "nullifiers[]", "4"],
            ["14", "withdrawAmount", "1"],
            ["15–16", "out_enabled[]", "2"],
            ["17–18", "c_outs[]", "2"],
          ]}
        />
      </Deeper>
      <Visibility seen={["The amount, the destination and the time"]} hidden={["Which notes paid for it — and so which deposit it came from"]} />
      <Callout tone="tip" title="The pool is the crowd">
        Privacy is strongest when many people hold many notes. Deposit 7.31 and withdraw 7.31 a few minutes later, and the timing and amount speak for themselves — split
        amounts and let time pass.
      </Callout>
    </>
  );
}

function FindingNotes() {
  return (
    <>
      <Lead>
        Nothing on-chain says which notes are yours — your wallet works it out by itself, from public events. This is how Noid mode shows you a private balance.
      </Lead>
      <Steps
        groups={[
          {
            where: "On your device",
            icon: "puzzle",
            items: [
              "Scans every NoteCreated(poolId, commitment, encryptedNote) event.",
              "Tries to decrypt each encryptedNote with your encPriv. A failure just means “not mine”.",
              "On success, recomputes Poseidon(1, amount, r, yourUserCommitment) and checks it equals the emitted commitment — so a note you can decrypt but don’t own is ignored.",
              "Computes the note’s nullifier and checks the NullifierSpent events: spent notes are skipped.",
              "What’s left is your unspent note set. Its sum is your private balance.",
            ],
          },
        ]}
      />
      <P>Encrypted notes are emitted as events rather than kept in contract storage: events are far cheaper, and only wallets ever need to read them.</P>
      <H3>Privacy with accountability</H3>
      <P>
        Menoid is built on the idea that you choose who sees your activity: privacy by default, transparency by choice. In V0.5 the encryption key opens the notes you receive —
        but a nullifier is made with sk, so proving what you spent would mean handing over spending power. V1 fixes exactly this, with a separate nullifier key (nk) and an
        outgoing viewing key (ovk): full viewing keys that show everything and spend nothing.
      </P>
      <Link href="/docs/viewing-keys" className="inline-block font-round text-[15px] font-semibold text-[#C9B0FF] hover:text-white">
        Viewing keys in V1 →
      </Link>
    </>
  );
}

function WhatChanged() {
  return (
    <>
      <Lead>V1 kept the idea — notes, nullifiers, proofs, a relayer — and rebuilt the rest for mainnet.</Lead>
      <Table
        head={["", "V0.5 — testnet", "V1 — mainnet"]}
        rows={[
          ["Runs in", "Its own wallet: extension + Android", "Any wallet, in the browser (app.menoid.xyz)"],
          ["Chains", "6 testnets: EVM, Solana, Sui, Aptos", "Monad and Base mainnets"],
          ["Tokens", "One native coin per pool", "Every token in one pool — hidden inside the note"],
          ["Key message", "menoid_Wallet", "Names the site, the network and a key index"],
          ["Keys", "sk + an encryption key pair", "sk, nk, and ivk / ovk per epoch"],
          ["Commitment", "Poseidon(1, amount, r, uc)", "Poseidon(4, token, amount, Poseidon(3, uc, r))"],
          ["Nullifier", "Poseidon(2, commitment, r, sk)", "Poseidon(5, nk, commitment, r)"],
          ["Mask", "Proved in the wallet, optional fee note", "No proof — the pool computes the commitment"],
          ["Swaps", "—", "Private swaps on Uniswap V3 and Capricorn"],
          ["Viewing keys", "A design goal", "Full, epoch and incoming keys; payment receipts"],
          ["Relayer", "Fixed in the contract", "Named by each proof — anyone can relay"],
          ["Root history", "10 roots", "100 roots"],
        ]}
      />
      <Link href="/docs" className="inline-block font-round text-[15px] font-semibold text-[#C9B0FF] hover:text-white">
        Read the V1 docs →
      </Link>
    </>
  );
}

function Reference() {
  return (
    <>
      <Label>Constants</Label>
      <Table
        head={["", "Value"]}
        rows={[
          ["Registration message", "menoid_Wallet"],
          ["Key tags", "menoid/spend · menoid/encryption"],
          ["BabyJubJub order l", <span key="l" className="break-all font-mono text-[12.5px]">2736030358979909402780800718157159386076813972158567259200215660948447373041</span>],
          ["Inputs per proof", "4 (MAX_INPUTS)"],
          ["Outputs", "transfer 3 (receiver, change, relayer) · withdraw 2 + a public payout"],
          ["Merkle trees", "depth 20 (1,048,576 leaves per pool) · last 10 roots"],
          ["Amounts", "0 ≤ amount < 2¹²⁸"],
          ["Domain separators", "1 commitment · 2 nullifier"],
          ["Proof system", "Groth16 (BN254) · Circom · snarkjs"],
          ["Note encryption", "ECIES (secp256k1 on EVM)"],
        ]}
      />
      <Label>Public signals</Label>
      <Table
        head={["Circuit", "Signals", "Layout"]}
        mono={[2]}
        rows={[
          ["Deposit", "5", "[depositAmount, c1, c2, c2_enabled, uc2]"],
          ["Transfer", "19", "[relayer, enabled×4, roots×4, nullifiers×4, output_enabled×3, c_outs×3]"],
          ["Withdraw", "19", "[receiver, relayer, enabled×4, roots×4, nullifiers×4, withdrawAmount, out_enabled×2, c_outs×2]"],
        ]}
      />
      <Label>Events</Label>
      <Table
        head={["Event", "When"]}
        mono={[0]}
        rows={[
          ["WalletRegistered(wallet, userCommitment, encryptionPublicKey)", "a wallet enabled Noid mode"],
          ["NoteCreated(poolId, commitment, encryptedNote)", "a note was created"],
          ["NullifierSpent(nullifier)", "a note was spent"],
          ["NewPool(poolId)", "a tree filled and a new pool opened"],
        ]}
      />
      <Label>Every formula</Label>
      <Formula
        label="Same on EVM, Solana, Aptos and Sui"
        code={`signature      = sign("menoid_Wallet")
sk             = keccak256("menoid/spend" ‖ signature) mod l
spendPk        = sk · Base8                               // BabyJubJub
encPriv        = keccak256("menoid/encryption" ‖ signature)
encPub         = encPriv · G
userCommitment = Poseidon(address, spendPk.x, spendPk.y)

commitment     = Poseidon(1, amount, r, userCommitment)
nullifier      = Poseidon(2, commitment, r, sk)

deposit:   depositAmount = a1 + c2_enabled · a2
transfer:  Σ inputs      = Σ outputs
withdraw:  Σ inputs      = Σ outputs + withdrawAmount`}
      />
      <Callout tone="warn" title="Testnet only">
        V0.5 runs on testnets and is unaudited. Its proving keys come from a local setup, suitable for testnet only. Use test tokens — never real funds.
      </Callout>
    </>
  );
}

/** slug → page body, in the order of pages.ts */
export const V05_CONTENT: Record<string, () => React.ReactNode> = {
  "": WhatIsV05,
  "key-derivation": KeyDerivation,
  "formulas": Formulas,
  "registration": Registration,
  "mask": Mask,
  "send": Send,
  "unmask": Unmask,
  "finding-notes": FindingNotes,
  "what-changed": WhatChanged,
  "reference": Reference,
};
