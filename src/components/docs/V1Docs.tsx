import Link from "next/link";

import {
  Addr,
  Bullets,
  C,
  Callout,
  Deeper,
  DocHero,
  Facts,
  Fields,
  Flow,
  Formula,
  FormulaCard,
  GLASS,
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
   V1 Mainnet — written from the code that runs it:
   website/src/lib/v1m (protocol.ts, build.ts, mirror.ts),
   menoid/evms (NoidPool.sol, the circuits) and the backend's
   relayer. Change a formula here only if it changed there.
   ──────────────────────────────────────────────────────────── */


const MONADSCAN = "https://monadscan.com";
const BASESCAN = "https://basescan.org";

const CONTRACTS: { chain: string; id: string; explorer: string; rows: [string, string][] }[] = [
  {
    chain: "Monad",
    id: "chain 143",
    explorer: MONADSCAN,
    rows: [
      ["NoidPool (proxy)", "0x3A3B64E3230C9A9aA32a1395C2c7B909cbe02EFB"],
      ["Implementation 1.0.0", "0x30Eb860540aB57523Cb8E35f78B37D89658F2595"],
      ["Transfer verifier", "0xaf3a6f7A0e8AF0bcaCE10fB6c2ca8a2207A63e7b"],
      ["Withdraw verifier", "0x436968db6B2B8E729cB21498030c5ebFa4ad0CE6"],
      ["Uniswap V3 adapter", "0xf5a599fA588C14C4787a090C7a30f2E4C163762B"],
      ["Capricorn adapter", "0xd6E8F9CaD752A21a741660B3aA244EA065A12cA7"],
    ],
  },
  {
    chain: "Base",
    id: "chain 8453",
    explorer: BASESCAN,
    rows: [
      ["NoidPool (proxy)", "0x436968db6B2B8E729cB21498030c5ebFa4ad0CE6"],
      ["Implementation 1.0.0", "0xaf3a6f7A0e8AF0bcaCE10fB6c2ca8a2207A63e7b"],
      ["Transfer verifier", "0xd2e673237A8F3C0574D45B279202871ca3B45353"],
      ["Withdraw verifier", "0xE48c823cE81D4f8C41664C38d09006628dAE369b"],
      ["Uniswap V3 adapter", "0x30Eb860540aB57523Cb8E35f78B37D89658F2595"],
    ],
  },
];

function Contracts() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {CONTRACTS.map((c) => (
        <div key={c.chain} className="rounded-[22px] p-4" style={GLASS}>
          <p className="mb-3 flex items-baseline gap-2">
            <span className="font-round text-[17px] font-semibold text-white">{c.chain}</span>
            <span className="font-mono text-[11.5px] text-white/45">{c.id}</span>
          </p>
          <div className="space-y-2.5">
            {c.rows.map(([label, address]) => (
              <div key={label}>
                <p className="font-round text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</p>
                <Addr value={address} explorer={c.explorer} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function V1Hero() {
  return (
    <DocHero
      eyebrow="Menoid docs · V1 Mainnet"
      title="Menoid V1"
      lede="The compliance-friendly multichain privacy layer, live on Monad and Base. Mask, send, swap and unmask privately from your browser — and show your history with a viewing key, only when you choose."
      chips={[{ label: "Live on Monad", live: true }, { label: "Live on Base", live: true }, { label: "Proofs made in your browser" }, { label: "Keys never leave your device" }]}
    >
      <Link href="/app" className="rounded-full px-5 py-2.5 font-round text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: LIT_INK, boxShadow: "0 10px 24px -10px rgba(59,37,112,0.7)" }}>
        Launch app V1
      </Link>
      <Link href="/docs/send" className="rounded-full px-4 py-2.5 font-round text-[14px] font-semibold text-[#3B2570] transition-colors hover:bg-[rgba(78,47,142,0.08)]">
        How a private send works →
      </Link>
    </DocHero>
  );
}

function WhatIsV1() {
  return (
    <>
      <Lead>
        Menoid V1 is the mainnet release of Menoid: a private app that runs in your browser at <strong>app.menoid.xyz</strong>. You connect the wallet you already use, sign
        one message, and that signature becomes your private keys. Your funds then live in a shielded pool as <strong>notes</strong> only you can open — and every move is
        checked by a zero-knowledge proof instead of a public balance.
      </Lead>
      <P>No new app to install, no second seed phrase, no second address. People pay you at your normal address; the pool does the rest.</P>

      <Label>What’s live today</Label>
      <Facts
        items={[
          ["Mainnets", "Monad (143) · Base (8453)"],
          ["Private actions", "Mask · Send · Swap · Unmask"],
          ["Tokens", "28 on Monad · 50 on Base"],
          ["Memecoins", "14 on Monad · 20 on Base"],
          ["Swap venues", "Uniswap V3 · Capricorn (Monad)"],
          ["Compliance", "Full viewing keys"],
          ["Proofs", "Groth16, made in your browser"],
          ["Testnets", "testnet.menoid.xyz, separate keys"],
        ]}
      />

      <Label>How the pieces fit</Label>
      <Flow
        nodes={[
          { icon: "wallet", title: "Your wallet", lines: ["MetaMask, Phantom…", "signs once"] },
          { icon: "browser", title: "Menoid app", lines: ["in your browser", "keys · proofs · decryption"] },
          { icon: "relayer", title: "Relayer", lines: ["submits private txs", "pays their gas"] },
          { icon: "pool", title: "NoidPool", lines: ["one per chain", "verifies · holds funds"] },
        ]}
        edges={["one signature", "proven calls", "transactions"]}
        caption="Keys and proofs stay in your browser. The relayer only carries finished, proven transactions — it can refuse one, never change one."
      />
      <Bullets
        items={[
          <>
            <strong>The app, in your browser,</strong> derives your keys, finds your notes by decrypting the pool’s events, and builds every proof locally. Menoid’s backend
            serves only public data: the pool’s events, prices, swap quotes and the relayer’s fee.
          </>,
          <>
            <strong>The relayer</strong> submits sends, swaps and unmasks from its own address and pays their gas, so your address never appears on them. It is paid with a
            private fee note, in the token you spend.
          </>,
          <>
            <strong>NoidPool</strong> is one contract per chain. It holds every token in one pool, keeps the Merkle tree of notes, verifies the proofs and refuses any note that
            was already spent.
          </>,
        ]}
      />

      <Label>Contracts</Label>
      <Contracts />
      <P className="text-[14px] text-white/55">
        Both chains were deployed from the same key, so a few addresses repeat across chains with different roles (Monad’s withdraw verifier and Base’s pool share one). That
        is expected, not a typo.
      </P>

      <Label>What the chain sees</Label>
      <Visibility
        seen={[
          "That an address registered for Menoid",
          "Masks: who masked which token, and how much",
          "Unmasks: which token, how much, and the receiving address",
          "Swaps: the token pair and both amounts",
          "Commitments, nullifiers and Merkle roots — opaque numbers",
          "Encrypted notes — unreadable without a viewing key",
        ]}
        hidden={[
          "Who sent a private payment, and who received it",
          "How much was sent, and in which token",
          "Your private balance",
          "Which mask paid for which unmask",
          "Who made a swap, and where its output went",
          "Your keys — they never leave your browser",
        ]}
      />
    </>
  );
}

function KeyDerivation() {
  return (
    <>
      <Lead>
        Menoid never asks for a new seed phrase. Your wallet signs one readable message, and every private key is derived from that signature, inside the browser tab. Sign
        again on another device and the same keys come back — nothing is stored on a server, nothing needs a backup.
      </Lead>

      <Label>The message you sign</Label>
      <Formula
        label="Message"
        code={`Menoid: create my private account keys.

Only sign this on https://app.menoid.xyz
Anyone holding this signature can spend your private balance.

Network: mainnet
Key index: 0`}
        caption="On testnet.menoid.xyz the origin line and the network say testnet — and every key comes out different."
      />

      <Label>The derivation</Label>
      <KeyTree
        root={[
          { code: "signature = wallet.signMessage(message)", edge: "+ the network name" },
          { code: "seed — 32 bytes, kept in memory only", edge: "one hash per purpose" },
        ]}
        columns={[
          { title: "Spending", icon: "key", rows: ["sk = H(spend, seed) mod l", "spendPk = sk · Base8", "nk = Poseidon(2, sk)"], note: "Spends notes. sk only ever enters a proof." },
          { title: "Incoming viewing", icon: "eye", rows: ["incomingSecret = H(incoming, seed)", "ivk(e) = H(ivk, incomingSecret, e)", "ivkPub(e) = ivk(e) · G"], note: "Opens the notes people send you." },
          { title: "Outgoing viewing", icon: "receipt", rows: ["outgoingSecret = H(outgoing, seed)", "ovk(e) = H(ovk, outgoingSecret, e)"], note: "Opens your own record of who you paid." },
        ]}
        merge={{ edge: "spendPk + your address", code: "userCommitment = Poseidon(1, address, spendPk.x, spendPk.y)", note: "Your private identity — registered on-chain together with ivkPub." }}
      />
      <Formula
        label="Exactly"
        code={`seed           = keccak256("menoid/v1m/seed" ‖ network ‖ signature)
sk             = keccak256("menoid/v1m/spend" ‖ seed) mod l           // BabyJubJub scalar
spendPk        = sk · Base8                                           // BabyJubJub point (x, y)
nk             = Poseidon(2, sk)                                      // nullifier key
incomingSecret = keccak256("menoid/v1m/incoming" ‖ seed)
outgoingSecret = keccak256("menoid/v1m/outgoing" ‖ seed)
ivk(e)         = keccak256("menoid/v1m/ivk" ‖ incomingSecret ‖ e) mod (n − 1) + 1
ivkPub(e)      = ivk(e) · G                                           // secp256k1 point, 65 bytes
ovk(e)         = keccak256("menoid/v1m/ovk" ‖ outgoingSecret ‖ e)
userCommitment = Poseidon(1, address, spendPk.x, spendPk.y)`}
        caption={
          <>
            ‖ is Solidity’s packed encoding (<C>solidityPackedKeccak256</C>). l is BabyJubJub’s subgroup order, n is secp256k1’s order, e is the viewing epoch (a uint32
            starting at 0). In the tree above, H(tag, …) is the same keccak256 with the tag <C>menoid/v1m/…</C>.
          </>
        }
      />

      <Label>Each field, and why</Label>
      <Fields
        rows={[
          ["message", "Plain text naming the network, the one site that should ask for it, and a key index.", "A phishing site’s request looks wrong at a glance; the network and the index choose which set of keys you get."],
          ["signature", "Your wallet’s 65-byte signature over the message. The same wallet signs it the same way every time.", "It seeds everything: no new seed phrase, and recovering on another device is just one more signature."],
          ["seed", "keccak256 of a tag, the network name and the signature.", "Mixes the network in a second time, so a mainnet signature handed to testnet code still gives unrelated keys."],
          ["sk", "The spending key: a number below l, BabyJubJub’s subgroup order.", "BabyJubJub lives in the BN254 field the proofs use, so a circuit can rebuild spendPk from sk cheaply. sk is only ever a private input of a proof."],
          ["spendPk", "sk · Base8 — a point (x, y) on BabyJubJub.", "The public half of sk. It goes into your userCommitment; it never appears on-chain by itself."],
          ["nk", "Poseidon(2, sk): the nullifier key.", "Nullifiers use nk, not sk — so an auditor can be shown what you spent without getting the power to spend."],
          ["incomingSecret", "A keccak256 of a tag and the seed.", "The root of every incoming viewing key, one per epoch."],
          ["ivk · ivkPub", "A secp256k1 key pair for epoch e. ivkPub is registered on-chain.", "Notes are encrypted to ivkPub (ECIES); only ivk opens them. “mod (n − 1) + 1” keeps ivk a valid private key."],
          ["outgoingSecret · ovk", "A tag and the seed, then one 32-byte key per epoch.", "Encrypts your own record of each payment, so your history also shows who you paid."],
          ["userCommitment", "Poseidon(1, address, spendPk.x, spendPk.y).", "Your private identity: it binds your public address to your spending key. Senders lock notes to it; proofs rebuild it to show ownership."],
          ["key index", "A number in the message, 0 to start.", "rotateKeys moves you to the next index — a whole new identity, if your signature ever leaked."],
          ["viewing epoch", "A number mixed into ivk and ovk, 0 to start.", "updateViewingKey moves you to the next epoch: fresh viewing keys, same identity, same balance."],
        ]}
      />

      <Label>A small example: what changes what</Label>
      <Table
        head={["You…", "sk · nk · userCommitment", "ivk · ovk"]}
        rows={[
          ["Sign again on another device", "Same", "Same"],
          ["Sign on testnet instead of mainnet", "All different", "All different"],
          ["Move to key index 1 (rotateKeys)", "All new", "All new"],
          ["Move to viewing epoch 1 (updateViewingKey)", "Same", "New, for epoch 1 on"],
        ]}
      />
      <Callout tone="warn" title="The signature is the master key">
        Anyone holding it can derive sk and spend your private balance. The app keeps it in memory in this tab only and never sends it anywhere — reload and you sign again.
        Sign the Menoid message only on <strong>app.menoid.xyz</strong> (or testnet.menoid.xyz for testnet keys).
      </Callout>
    </>
  );
}

function Formulas() {
  return (
    <>
      <Lead>
        Menoid keeps no balances. Value lives as <strong>notes</strong> — like banknotes: each has an owner, a token and an amount, and it is spent whole. The chain never sees a
        note itself, only numbers derived from it. Here is every formula the protocol uses, what it is for, and a small example of each.
      </Lead>
      <P>
        Every Poseidon hash starts with a small number, a <strong>domain separator</strong> from 1 to 5. It guarantees no hash can ever be mistaken for another kind, even with
        the same inputs.
      </P>
      <Table
        head={["Tag", "Hash", "Gives you"]}
        mono={[1]}
        rows={[
          ["1", "Poseidon(1, address, spendPk.x, spendPk.y)", "userCommitment — your identity"],
          ["2", "Poseidon(2, sk)", "nk — the nullifier key"],
          ["3", "Poseidon(3, userCommitment, r)", "npk — a note’s owner, blinded"],
          ["4", "Poseidon(4, token, amount, npk)", "commitment — the note on-chain"],
          ["5", "Poseidon(5, nk, commitment, r)", "nullifier — the note’s spent marker"],
        ]}
      />

      <FormulaCard
        symbol="uc"
        name="userCommitment — your private identity"
        code="userCommitment = Poseidon(1, address, spendPk.x, spendPk.y)"
        what="One number that stands for you inside the pool. It contains your public address and your spending public key."
        why="Because it contains your address, people can pay you at your normal address: the pool maps address → userCommitment. Because it contains spendPk, only the holder of sk can prove it is theirs."
        used="Registration (stored on-chain), every note you receive (inside npk), and every proof you make — the circuit rebuilds it from sk and your address, and the proof fails if it doesn’t match."
        example="Bob pays Alice. His app reads registrationOf(Alice’s address) and gets uc_A, then locks a note to it. Knowing Alice’s address and uc_A is no help in spending that note: that needs Alice’s sk."
      />
      <FormulaCard
        symbol="nk"
        name="The nullifier key"
        code="nk = Poseidon(2, sk)"
        what="A one-way hash of your spending key."
        why="Nullifiers are computed from nk instead of sk. Poseidon can’t be run backwards, so sharing nk shows which of your notes are spent without giving away sk."
        used="Every nullifier you publish, and your full viewing key."
        example="An auditor holding Alice’s full viewing key computes the nullifier of each of her notes and sees which were spent, and when. They still can’t make a proof — that needs sk."
      />
      <FormulaCard
        symbol="npk"
        name="The note public key — a note’s owner, blinded"
        code={`r   = 31 random bytes                    // fresh for every note
npk = Poseidon(3, userCommitment, r)`}
        what="The owner of one note, hidden behind that note’s own random number r."
        why="Without r, every note to Alice would carry the same owner value and be trivially linkable. With r, two notes to the same person look unrelated."
        used="Every commitment — and swaps, where the owner of the bought note (npkOut) is fixed before its amount exists."
        example="Alice gets two payments: Poseidon(3, uc_A, r₁) and Poseidon(3, uc_A, r₂). Two unrelated-looking numbers; nobody can tell they both belong to Alice."
      />
      <FormulaCard
        symbol="cm"
        name="commitment — the note, as the chain stores it"
        code="commitment = Poseidon(4, token, amount, npk)"
        what="A note’s public fingerprint: one leaf of the pool’s Merkle tree. It hides the owner, the token and the amount."
        why="The token sits inside the hash, so one pool and one tree hold every token — and a private send doesn’t even reveal which token moved."
        used="Created by every mask, send, swap and unmask; proved to exist (with a Merkle path) when the note is spent."
        example={
          <>
            Mask 5 MON: the pool wraps it to WMON and computes <C>Poseidon(4, WMON, 5·10¹⁸, npk)</C> itself, from the tokens it actually received. The 5 can’t be faked — the
            amount in the note is the amount that arrived.
          </>
        }
      />
      <FormulaCard
        symbol="nf"
        name="nullifier — the note’s spent marker"
        code="nullifier = Poseidon(5, nk, commitment, r)"
        what="A number published when — and only when — the note is spent."
        why="The pool remembers every nullifier and refuses one it has seen, so no note is spent twice. Only the owner (nk and r) can compute it, and nobody can link it back to its commitment — spending doesn’t reveal which note was spent."
        used="Every send, swap and unmask publishes exactly 4 nullifiers (empty slots get dummies)."
        example="Alice spends her 5 MON note and the proof publishes nullifier N. Anyone submitting N again gets “Nullifier already spent” — and nothing moves."
      />
      <FormulaCard
        symbol="root"
        name="Merkle root — proof that a note exists"
        code={`leaf = commitment                     // 0 for an empty leaf
node = Poseidon(left, right)
root = the top of a depth-20 tree       // 1,048,576 leaves; a full tree opens a new one
// every operation inserts one chunk of 4 leaves; the pool keeps the last 100 roots`}
        what="One number that summarises every note in a tree."
        why="A proof shows “my note is one of the leaves under this root” without saying which leaf — that is what hides the spender among everyone. Keeping the last 100 roots means a proof made a moment ago still lands after other transactions move the tree."
        used="Every send, swap and unmask proves its input notes against a recent root."
        example="You prove against root R. Before your transaction lands, three other operations change the tree. R is still one of the last 100 roots, so your proof is accepted."
      />
      <FormulaCard
        symbol="ext"
        name="extDataHash — everything outside the proof, locked to it"
        code={`domain      = keccak256("menoid.v1m.transfer" | "menoid.v1m.withdraw" | "menoid.v1m.swap")
extDataHash = keccak256(abi.encode(chainId, pool, domain, ext)) mod p`}
        what="One public input of the proof that commits to the transaction’s extra data: the encrypted notes and the outgoing record — plus the recipient for an unmask, and the adapter, route, minimum output and deadline for a swap."
        why="Change any byte of that data — the recipient, say — and the hash no longer matches the proof, so verification fails. chainId and the pool address stop a proof from being replayed on another chain or pool."
        used="Send, swap and unmask. p is the BN254 field size."
        example="Alice unmasks to 0xB0B…. If a relayer swapped in its own address, extDataHash would change and the pool would reject the proof. A relayer can carry the transaction or drop it — never redirect it."
      />
      <FormulaCard
        symbol="enc"
        name="encrypted note — how the owner finds a note"
        code={`plaintext     = version ‖ flags ‖ token ‖ amount ‖ r      // 1 + 1 + 20 + 16 + 32 = 70 bytes
encryptedNote = ECIES(owner’s ivkPub, plaintext)        // secp256k1, compressed ephemeral key`}
        what="The note’s contents, sealed to its owner’s viewing key and emitted in the NoteCreated event."
        why="Nothing on-chain says which notes are yours. Your app tries to decrypt every note with your ivk; a success that also rebuilds the commitment means the note is yours."
        used="Every note created. A swap’s bought note carries the flag AMOUNT_FROM_EVENT: its amount is read from the Swapped event, because nobody knew it when the proof was made."
        example={
          <>
            Bob sends Alice 2 USDC. The receiver output is encrypted to Alice’s ivkPub. Her app decrypts it, rebuilds <C>Poseidon(4, USDC, 2·10⁶, Poseidon(3, uc_A, r))</C>,
            finds it equals the commitment on-chain, and shows +2 USDC.
          </>
        }
      />
      <FormulaCard
        symbol="rec"
        name="outgoing record — your memo of who you paid"
        code={`key    = HKDF-SHA256(ovk, salt = firstNullifier, info = "menoid/v1m/outgoing-record")
record = nonce(12) ‖ AES-256-GCM(key, action ‖ token ‖ amount ‖ fee ‖ counterparty…) ‖ tag(16)`}
        what="A private record of each spend, readable only with your ovk: the action (send, unmask, swap), token, amount, fee and counterparty."
        why="Notes you receive can be found with ivk, but a payment you make leaves you nothing to decrypt. The record restores the other side of your history — who you paid — for you and for anyone holding your full viewing key."
        used="Emitted with every send, swap and unmask as OutgoingRecord(firstNullifier, record)."
        example="Alice’s app sees her note’s nullifier N spent, derives the key from her ovk and N, and decrypts: “sent 2 USDC to 0xB0B…, fee 0.01 USDC”."
      />
    </>
  );
}

function Registration() {
  return (
    <>
      <Lead>
        Before your first private action, your address registers once on each chain: one transaction that publishes your userCommitment and your viewing public key. From then
        on, anyone can pay you privately at your normal address.
      </Lead>
      <Facts
        items={[
          ["Sent by", "Your wallet"],
          ["Proof", "None"],
          ["Gas", "Paid by you"],
          ["Stores", "userCommitment + ivkPub"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "pen", title: "Your wallet", lines: ["signs the key message", "no gas"] },
          { icon: "browser", title: "Menoid app", lines: ["derives your keys", "checks registrationOf"] },
          { icon: "wallet", title: "Your wallet", lines: ["sends register()", "one transaction"] },
          { icon: "pool", title: "NoidPool", lines: ["stores your identity", "once per address"] },
        ]}
        edges={["signature", "uc + ivkPub", "transaction"]}
      />
      <Steps
        groups={[
          {
            where: "In your browser",
            icon: "browser",
            note: "nothing leaves this tab",
            items: [
              "The app asks your wallet to sign the key message — a signature, not a transaction.",
              "It derives your keys from the signature: sk, nk, ivk, ovk and your userCommitment.",
              <>
                It calls <C>registrationOf(address)</C>. Already registered with this userCommitment? Then you’re signed in — nothing else to do.
              </>,
            ],
          },
          {
            where: "Your wallet",
            icon: "wallet",
            items: [
              <>
                Sends <C>register(userCommitment, ivkPub)</C> — ivkPub of epoch 0, 65 bytes.
              </>,
            ],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Refuses an address that is already registered.",
              "Checks the userCommitment is non-zero, inside the field, and not already claimed by another address. An honest commitment contains its own address, so copying someone else’s is the only way to collide.",
              "Checks the viewing key is 65 bytes starting with 0x04 — an uncompressed secp256k1 key.",
              <>
                Stores your registration (userCommitment, viewing key, key index 0, epoch 0) and emits <C>Registered(wallet, userCommitment, viewingPublicKey)</C>.
              </>,
            ],
          },
        ]}
      />

      <H3>How a sender finds you</H3>
      <P>
        <C>registrationOf(address)</C> returns <C>(userCommitment, viewingPublicKey, keyIndex, viewingEpoch)</C>. A sender needs the first two: the userCommitment to lock the note
        to you, the viewing key to encrypt it so only you can read it. Both come from one call to the chain — no server sits between a sender and the answer.
      </P>
      <Callout tone="tip" title="Paying someone who never registered">
        The app finds an empty registration and offers the public way instead: an unmask straight into their wallet. It tells you before you confirm.
      </Callout>

      <H3>Changing keys later</H3>
      <Table
        head={["Function", "What changes", "When"]}
        mono={[0]}
        rows={[
          ["updateViewingKey(ivkPub)", "Viewing epoch + 1: new ivk and ovk for new notes. Same identity, same balance.", "Fresh viewing keys — e.g. after sharing an epoch key."],
          ["rotateKeys(uc, ivkPub)", "Key index + 1: a whole new identity (new sk, nk, ivk, ovk).", "If your signature ever leaked. Notes locked to the old identity still need the old keys."],
        ]}
      />
      <Visibility seen={["That this address uses Menoid", "Its userCommitment and viewing public key"]} hidden={["Your keys", "Your balance and activity — there is nothing to see yet"]} />
    </>
  );
}

function Mask() {
  return (
    <>
      <Lead>
        Masking moves tokens from your public wallet into the pool, as a private note only you can open. It is the one action with no relayer and no proof: tokens leaving
        your address are public anyway, so your wallet sends it, and the pool builds the note itself.
      </Lead>
      <Facts
        items={[
          ["Sent by", "Your wallet"],
          ["Proof", "None — the pool hashes"],
          ["Gas", "Paid by you"],
          ["Creates", "1 private note"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "browser", title: "Menoid app", lines: ["picks r, builds npk", "encrypts the note"] },
          { icon: "wallet", title: "Your wallet", lines: ["approve (ERC-20)", "deposit()"] },
          { icon: "pool", title: "NoidPool", lines: ["computes the commitment", "inserts it in the tree"] },
          { icon: "eye", title: "Your balance", lines: ["the app finds and", "decrypts the note"] },
        ]}
        edges={["npk + encrypted note", "tokens + transaction", "NoteCreated"]}
        caption="No relayer here: a mask is public by nature — the chain sees your address send the tokens."
      />
      <Steps
        groups={[
          {
            where: "In your browser",
            icon: "browser",
            items: [
              "You choose a token and an amount.",
              "The app picks a fresh random r and computes npk = Poseidon(3, userCommitment, r) — the note’s owner, blinded.",
              "It encrypts (token, amount, r) to your own viewing key: the encryptedNote.",
            ],
          },
          {
            where: "Your wallet",
            icon: "wallet",
            items: [
              "For an ERC-20, approves the pool for the amount (only if the allowance is short).",
              <>
                Sends <C>deposit(token, amount, npk, encryptedNote)</C> — or <C>depositNative(npk, encryptedNote)</C> with the coins attached, for MON or ETH.
              </>,
            ],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Checks masks aren’t paused, the token is accepted, and 0 < amount ≤ its per-mask cap.",
              "Pulls the tokens and checks its balance grew by exactly that amount (tokens that skim a fee on transfer are refused). Native coins are wrapped: MON → WMON, ETH → WETH.",
              "Checks npk is non-zero and inside the field, then computes commitment = Poseidon(4, token, amount, npk) itself.",
              "Refuses a commitment that already exists, then inserts it as one chunk of 4 leaves (your note and 3 empty ones) and records the new root.",
              <>
                Emits <C>NoteCreated(treeId, leafIndex, commitment, encryptedNote)</C> and <C>Deposited(depositor, token, amount, commitment)</C>.
              </>,
            ],
          },
          {
            where: "Back in your browser",
            icon: "eye",
            items: ["The app syncs the new event, decrypts it with your ivk, rebuilds the commitment to confirm it — and your private balance goes up."],
          },
        ]}
      />
      <H3>Why no proof is needed</H3>
      <P>
        A proof exists to show something the chain can’t check by itself. Here it can: the pool sees the token and the amount arrive, and computes the commitment from them. The
        only thing you supply is npk, which decides who owns the note and can’t add value. A note can never be worth more than what was actually masked.
      </P>
      <Callout title="Monad smart accounts keep 10 MON">
        On Monad, an account with code — including a MetaMask smart account (EIP-7702) — must keep 10 MON after every transaction it sends. The app knows, and shows how much you
        can mask.
      </Callout>
      <Visibility
        seen={["Your address masked", "Which token, how much, and when"]}
        hidden={["When that note is spent and where its value goes — its nullifier can’t be linked back to it"]}
      />
    </>
  );
}

function Send() {
  return (
    <>
      <Lead>
        A private send moves value from your notes to someone else’s, inside the pool. Your browser makes a zero-knowledge proof; a relayer submits it. The chain learns that some
        notes were spent and some were created — not who, not how much, not even which token.
      </Lead>
      <Facts
        items={[
          ["Sent by", "The relayer"],
          ["Proof", "transfer (Groth16)"],
          ["Fee", "A private note, same token"],
          ["Notes", "up to 4 in → 3 out"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "browser", title: "Menoid app", lines: ["picks your notes", "makes the proof"] },
          { icon: "relayer", title: "Relayer", lines: ["checks its fee", "simulates · submits"] },
          { icon: "pool", title: "NoidPool", lines: ["verifies the proof", "spends · inserts"] },
          { icon: "person", title: "Receiver", lines: ["finds the note", "with their ivk"] },
        ]}
        edges={["proof + encrypted notes", "transfer()", "NoteCreated"]}
        caption="Your address never appears on the transaction: the relayer sends it and pays the gas."
      />
      <Steps
        groups={[
          {
            where: "In your browser",
            icon: "browser",
            items: [
              "Looks up the recipient with registrationOf: their userCommitment and viewing key.",
              "Asks the relayer for its fee in this token — its real gas cost plus a small margin.",
              "Picks up to 4 of your unspent notes in that token, largest first, covering amount + fee. Empty slots get zero-value dummy notes.",
              "Builds 3 outputs: the receiver’s note (the amount), your change (the rest), and the relayer’s fee note — always last.",
              "Encrypts each output to its owner’s viewing key, and writes your outgoing record with your ovk.",
              "Computes extDataHash over the encrypted outputs and the record, then makes the proof with the transfer circuit.",
            ],
          },
          {
            where: "At the relayer",
            icon: "relayer",
            note: "a courier — it can’t read or change anything",
            items: [
              "Opens its fee note with its own viewing key and checks it rebuilds the commitment in the proof, is in the token being spent, and covers the fee.",
              "Simulates the transaction: a bad proof, a spent note or a stale root fails here, for free.",
              "Submits transfer(calls) from its own address and pays the gas.",
            ],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Checks the tree exists, the root is one of its last 100, and the 4 nullifiers are unspent and all different.",
              "Verifies the proof against [root, 4 nullifiers, 3 output commitments, relayer, extDataHash].",
              "Marks the 4 nullifiers spent, inserts the 3 new commitments, and emits NoteCreated ×3 and OutgoingRecord.",
            ],
          },
          {
            where: "On the receiver’s side",
            icon: "person",
            items: ["Their app decrypts the new note with their ivk, rebuilds its commitment, and shows it in their private balance."],
          },
        ]}
      />
      <H3>What the proof proves</H3>
      <Bullets
        items={[
          <>
            <strong>You own the inputs.</strong> From sk the circuit rebuilds spendPk, then your userCommitment with your address — and every input must be built from it.
          </>,
          <>
            <strong>They exist.</strong> Each real input’s Merkle path leads to the public root. Zero-value dummies skip this check; they can’t carry value.
          </>,
          <>
            <strong>The nullifiers are theirs.</strong> Each equals Poseidon(5, nk, commitment, r), with nk rebuilt from sk.
          </>,
          <>
            <strong>Nothing is created.</strong> Every amount is below 2¹²⁸, and the inputs add up exactly to the outputs.
          </>,
          <>
            <strong>The relayer gets the last output</strong> — its owner must be the relayer named in the public inputs.
          </>,
          <>
            <strong>The extra data is locked.</strong> extDataHash is a public input, so the encrypted notes can’t be swapped out.
          </>,
          <>
            <strong>One token throughout.</strong> Inputs and outputs share one token — and it stays private.
          </>,
        ]}
      />
      <H3>More than 4 notes</H3>
      <P>
        One proof spends at most 4 notes. A bigger payment is split into up to 4 proofs, relayed together in one transaction, each paying its own fee note. Every proof has the
        same shape — 4 nullifiers in, 3 notes out — so nobody can tell how many real notes you spent.
      </P>
      <Visibility
        seen={["That a private send happened, and when", "4 nullifiers and 3 new commitments", "The relayer’s address as the sender"]}
        hidden={["Who sent it, and who received it", "The amount", "The token", "Which notes were spent"]}
      />
      <Deeper title="The transfer circuit, input by input">
        <Table
          head={["Public input", "Count", "What it is"]}
          mono={[0]}
          rows={[
            ["root", "1", "a recent root of the inputs’ tree"],
            ["nullifiers", "4", "the inputs’ spent markers"],
            ["outCommitments", "3", "receiver · change · relayer fee"],
            ["relayer", "1", "the relayer’s userCommitment"],
            ["extDataHash", "1", "the encrypted outputs and outgoing record"],
          ]}
        />
        <P>
          Private inputs: sk, your address, the token, and each input’s amount, r and Merkle path; each output’s amount, r and owner. The circuit has 26,856 constraints; its
          proving key (about 18 MB) downloads once and is cached.
        </P>
      </Deeper>
    </>
  );
}

function Swap() {
  return (
    <>
      <Lead>
        A private swap trades one token for another without leaving the pool. Your notes pay, the pool itself trades on a DEX, and what you buy lands as a new private note. The
        chain sees a trade happen — never whose it was, or where the output went.
      </Lead>
      <Facts
        items={[
          ["Sent by", "The relayer"],
          ["Proof", "withdraw circuit, reused"],
          ["Venues", "Uniswap V3 · Capricorn"],
          ["Notes", "up to 4 in → 3 out"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "browser", title: "Menoid app", lines: ["takes the best quote", "makes the proof"] },
          { icon: "relayer", title: "Relayer", lines: ["checks its fee", "submits swap()"] },
          { icon: "pool", title: "NoidPool", lines: ["verifies · spends", "finishes your note"] },
          { icon: "dex", title: "DEX", lines: ["Uniswap V3", "or Capricorn"] },
        ]}
        edges={["proof + swap data", "swap()", { label: "tokenIn →", back: "← tokenOut" }]}
        caption="The pool trades through a whitelisted adapter and measures what came back; the bought note is finished on-chain."
      />
      <Steps
        groups={[
          {
            where: "The quote",
            icon: "dex",
            note: "Menoid’s backend — public data only",
            items: ["Quotes every route — each Uniswap V3 fee tier, two-hop paths and, on Monad, Capricorn’s pools — and returns the best: the adapter, the route, the expected output."],
          },
          {
            where: "In your browser",
            icon: "browser",
            items: [
              "Sets minOut from the quote and your slippage, and a deadline.",
              "Picks notes of the token you sell covering amountIn + fee; the outputs are your change and the relayer’s fee note.",
              "Fixes the owner of the note you’re buying before its amount exists: a fresh rOut, npkOut = Poseidon(3, userCommitment, rOut).",
              "Encrypts (tokenOut, rOut) to your viewing key with the flag “amount from event”.",
              "Hashes the adapter, tokenOut, minOut, deadline, npkOut, route and encrypted data into extDataHash, and proves with the withdraw circuit (publicToken = tokenIn, publicAmount = amountIn).",
            ],
          },
          {
            where: "At the relayer",
            icon: "relayer",
            items: ["Checks its fee note, simulates, and submits swap(calls)."],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Checks swaps aren’t paused, tokenOut is accepted, the adapter is whitelisted, the deadline hasn’t passed, minOut > 0 and npkOut is valid — then the root and nullifiers.",
              "Verifies the proof and marks the nullifiers spent — before any external call.",
              "Sends amountIn to the adapter, which trades on the DEX and returns tokenOut to the pool.",
              "Measures: exactly amountIn left the pool, and out = its tokenOut balance after − before, with out ≥ minOut.",
              "Finishes your note: commitment = Poseidon(4, tokenOut, out, npkOut). Inserts the change, fee and bought notes, and emits NoteCreated ×3, OutgoingRecord and Swapped(tokenIn, tokenOut, amountIn, amountOut, commitment, adapter).",
            ],
          },
          {
            where: "Back in your browser",
            icon: "eye",
            items: ["Decrypts the bought note, sees the flag, reads amountOut from the Swapped event and rebuilds the commitment — it’s yours."],
          },
        ]}
      />
      <Table
        head={["Venue", "Chains", "How the pool trades"]}
        rows={[
          ["Uniswap V3", "Monad · Base", "UniswapV3Adapter → Uniswap’s SwapRouter02; every fee tier, one or two hops"],
          ["Capricorn", "Monad", "V3PoolAdapter swaps directly in the pools of nad.fun’s DEX (a Uniswap V3 fork), where Monad’s memecoins trade"],
        ]}
      />
      <Callout tone="tip" title="If the price moves">
        Output below minOut, or the deadline passed? The whole transaction reverts — the nullifiers stay unspent and your notes stay exactly as they were.
      </Callout>
      <Visibility
        seen={["That a swap happened: the token pair and both amounts", "Which venue’s adapter traded"]}
        hidden={["Who swapped", "Which notes paid", "Who owns the note that was bought"]}
      />
    </>
  );
}

function Unmask() {
  return (
    <>
      <Lead>
        Unmasking sends private funds back to a public address — your own wallet or anyone else’s. Your notes are spent and the pool pays the tokens out. Like a send, it is
        proven in your browser and submitted by the relayer.
      </Lead>
      <Facts
        items={[
          ["Sent by", "The relayer"],
          ["Proof", "withdraw (Groth16)"],
          ["Pays to", "Any address"],
          ["Notes", "up to 4 in → 2 out"],
        ]}
      />
      <Flow
        nodes={[
          { icon: "browser", title: "Menoid app", lines: ["picks your notes", "proves the unmask"] },
          { icon: "relayer", title: "Relayer", lines: ["checks its fee", "submits withdraw()"] },
          { icon: "pool", title: "NoidPool", lines: ["verifies · spends", "pays out"] },
          { icon: "globe", title: "Any address", lines: ["receives the tokens", "publicly"] },
        ]}
        edges={["proof + recipient", "withdraw()", "tokens"]}
      />
      <Steps
        groups={[
          {
            where: "In your browser",
            icon: "browser",
            items: [
              "You choose the amount and the receiving address — your wallet by default. For MON or ETH you can receive the coin itself instead of WMON or WETH.",
              "Picks notes covering amount + fee; the outputs are your change and the relayer’s fee note.",
              "Locks the recipient, the unwrap choice, the encrypted outputs and your outgoing record into extDataHash.",
              "Proves with the withdraw circuit: publicToken and publicAmount are the token and amount leaving the pool.",
            ],
          },
          {
            where: "At the relayer",
            icon: "relayer",
            items: ["Checks its fee note, simulates, and submits withdraw(calls)."],
          },
          {
            where: "Inside NoidPool",
            icon: "pool",
            items: [
              "Checks the amount (non-zero, below 2¹²⁸), the recipient (non-zero), and that only the wrapped native token is ever unwrapped.",
              "Checks the root and nullifiers, and verifies the proof against [root, 4 nullifiers, 2 commitments, relayer, token, amount, extDataHash].",
              "Marks the nullifiers spent, inserts the change and fee notes, and emits NoteCreated ×2 and OutgoingRecord.",
              "Only then — with every state change final — pays the recipient (unwrapping if asked) and emits Withdrawn(token, recipient, amount).",
            ],
          },
        ]}
      />
      <H3>The recipient can’t be changed</H3>
      <P>
        The recipient is not an instruction to the relayer — it is part of extDataHash, which the proof commits to. A relayer that edits it makes the proof fail. The relayer is a
        courier, not a custodian: it can deliver your unmask or drop it, never re-address it.
      </P>
      <Callout title="Sends and unmasks can’t be paused">
        The pool’s owner can pause new masks and swaps, but sends and unmasks have no pause switch: funds in the pool can always leave.
      </Callout>
      <Visibility seen={["The token, the amount and the receiving address", "When it happened"]} hidden={["Who unmasked", "Which notes — and so which mask — paid for it"]} />
      <Callout tone="tip" title="Stay in the crowd">
        The pool hides the link between a mask and an unmask, but amounts and timing can still speak: mask 7.31 USDC and unmask 7.31 USDC a minute later, and the coincidence is
        obvious. Different amounts and some time in between keep you hidden among everyone else.
      </Callout>
    </>
  );
}

function ViewingKeys() {
  return (
    <>
      <Lead>
        Privacy by default, transparency by choice. A viewing key lets someone you choose — an auditor, an exchange, an accountant — see your private activity. It never lets
        them spend.
      </Lead>
      <Table
        head={["Key", "Holds", "They can see", "Spend?"]}
        rows={[
          ["Incoming viewing key", "ivk for one epoch", "Notes you received in that epoch", "No"],
          ["Epoch viewing key", "ivk + ovk for one epoch", "Your activity in that period only", "No"],
          ["Full viewing key", "incomingSecret, outgoingSecret, nk, userCommitment", "Everything: received, spent, who you paid, your balance", "No"],
          ["Payment receipt", "One note’s opening (token, amount, owner, r)", "One payment — and no key at all", "No"],
        ]}
      />
      <P className="text-[14.5px] text-white/60">The protocol supports all four; the app shares the full viewing key.</P>

      <H3>How a viewing key reads the pool</H3>
      <Steps
        groups={[
          {
            where: "In the viewer’s browser",
            icon: "eye",
            note: "the same public data for everyone",
            items: [
              "Downloads every NoteCreated, NullifierSpent, OutgoingRecord and Swapped event. Everyone downloads everything, so nothing reveals whose key is being used.",
              "Derives ivk and ovk for every epoch, from 0 to the current one.",
              "Tries to decrypt every note with each ivk. A swap’s bought note takes its amount from the Swapped event.",
              "Keeps a note only if Poseidon(4, token, amount, Poseidon(3, userCommitment, r)) equals the commitment on-chain — anyone can encrypt something to you, but only real notes rebuild. Zero-value dummies are skipped.",
              "Computes each note’s nullifier with nk: if it appears in NullifierSpent, the note is spent — and the viewer sees when.",
              "Opens the outgoing records with ovk: who was paid, how much, and the fee.",
              "Result: the balance of every token and the full history — masked, received, sent, swapped, unmasked.",
            ],
          },
        ]}
      />

      <H3>The full viewing key, as a string</H3>
      <Formula
        label="Format"
        code={`menoid-vk1:<base64url(json)>.<checksum>

json     = { kind: "full", address, network, keyIndex,
             userCommitment, incomingSecret, outgoingSecret, nullifierKey }
checksum = first 4 bytes of keccak256(payload)       // catches a mistyped key`}
      />

      <H3>In the app</H3>
      <Bullets
        items={[
          <>
            <strong>Share yours:</strong> click your address to open your account, then <strong>Copy viewing key</strong>.
          </>,
          <>
            <strong>Read someone’s:</strong> at the bottom of the account box, <strong>View someone’s private activity</strong>, then paste their key. It is decrypted in your
            browser and never sent anywhere — and the app checks the key really matches their on-chain registration.
          </>,
        ]}
      />

      <H3>Why it can’t spend</H3>
      <P>
        Spending needs a proof, and a proof needs sk — the circuit rebuilds spendPk and your userCommitment from it. A viewing key holds nk = Poseidon(2, sk): enough to recognise
        spent notes, but Poseidon can’t be run backwards to get sk.
      </P>
      <Callout tone="warn" title="Sharing can’t be undone">
        Whoever holds your full viewing key can read everything it covers — including future activity under the same key index. To stop that, move to a new key index with
        rotateKeys: a new identity they can’t see. updateViewingKey only changes the epoch, which shuts out holders of an epoch key, not of a full one.
      </Callout>
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
          ["Proof system", "Groth16 on BN254 · Circom circuits · snarkjs, in the browser"],
          ["Circuits", "transfer (4 in, 3 out) · withdraw (4 in, 2 out; swap uses it too)"],
          ["Field p (BN254)", <span key="p" className="break-all font-mono text-[12.5px]">21888242871839275222246405745257275088548364400416034343698204186575808495617</span>],
          ["BabyJubJub order l", <span key="l" className="break-all font-mono text-[12.5px]">2736030358979909402780800718157159386076813972158567259200215660948447373041</span>],
          ["Merkle trees", "depth 20 (1,048,576 leaves) · 4-leaf chunks · last 100 roots · a new tree when full"],
          ["Inputs per proof", "4, dummies filling the gaps · up to 4 proofs per transaction"],
          ["Amounts", "below 2¹²⁸ in every circuit"],
          ["Note encryption", "ECIES on secp256k1, compressed ephemeral key · 70-byte plaintext"],
          ["Outgoing records", "HKDF-SHA256 + AES-256-GCM · 138-byte plaintext"],
          ["Domain separators", "1 userCommitment · 2 nk · 3 npk · 4 commitment · 5 nullifier"],
        ]}
      />

      <Label>Events</Label>
      <Table
        head={["Event", "When"]}
        mono={[0]}
        rows={[
          ["Registered(wallet, userCommitment, viewingPublicKey)", "an address registers"],
          ["ViewingKeyUpdated(wallet, viewingPublicKey, viewingEpoch)", "updateViewingKey"],
          ["KeysRotated(wallet, userCommitment, viewingPublicKey, keyIndex)", "rotateKeys"],
          ["NoteCreated(treeId, leafIndex, commitment, encryptedNote)", "every new note"],
          ["NullifierSpent(nullifier)", "every spent note — 4 per proof"],
          ["OutgoingRecord(firstNullifier, record)", "every send, swap and unmask"],
          ["Deposited(depositor, token, amount, commitment)", "a mask"],
          ["Withdrawn(token, recipient, amount)", "an unmask"],
          ["Swapped(tokenIn, tokenOut, amountIn, amountOut, commitment, adapter)", "a swap"],
          ["NewTree(treeId)", "a tree filled and a new one opened"],
        ]}
      />

      <H3>Trusted setup</H3>
      <P>
        Groth16 needs a one-time setup per circuit; whoever knew all of its secret randomness could forge proofs. Menoid’s mainnet keys come from two phases. Phase 1 is the
        public Hermez / Polygon perpetual powers of tau. Phase 2 is Menoid’s own ceremony, per circuit: two contributions, then a random beacon taken from Monad block
        113,529,011. The setup is sound if any single contributor was honest. Testnets use a separate development setup.
      </P>

      <H3>Who controls what</H3>
      <Bullets
        items={[
          "NoidPool is an upgradeable proxy (UUPS, ERC-1967). Its owner can upgrade it, choose the accepted tokens and their per-mask caps, whitelist swap adapters, and pause masks or swaps.",
          "Sends and unmasks have no pause: funds can always leave the pool.",
          "Anyone can relay — a proof names who gets the fee. The relayer can refuse a transaction; it can’t read, redirect or forge one, or keep anything but its fee note.",
          "Your keys never leave your browser. The backend serves public data only.",
        ]}
      />
    </>
  );
}

/** slug → page body, in the order of pages.ts */
export const V1_CONTENT: Record<string, () => React.ReactNode> = {
  "": WhatIsV1,
  "key-derivation": KeyDerivation,
  "formulas": Formulas,
  "registration": Registration,
  "mask": Mask,
  "send": Send,
  "swap": Swap,
  "unmask": Unmask,
  "viewing-keys": ViewingKeys,
  "reference": Reference,
};
