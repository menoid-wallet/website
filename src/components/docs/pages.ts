/* ────────────────────────────────────────────────────────────
   The docs' table of contents: one page per section, in
   reading order. Plain data, shared by the server pages
   (titles, metadata, previous / next) and the client shell
   (sidebar, version switcher). A page's number is its place
   in this list.
   ──────────────────────────────────────────────────────────── */

export type DocVersion = "v1" | "v0.5";
export type DocPage = { slug: string; label: string; kicker: string; description: string };
export type DocBook = { id: DocVersion; base: string; label: string; short: string; sub: string; pages: DocPage[] };

export const BOOKS: Record<DocVersion, DocBook> = {
  v1: {
    id: "v1",
    base: "/docs",
    label: "V1 Mainnet",
    short: "V1",
    sub: "Monad · Base",
    pages: [
      {
        slug: "",
        label: "What V1 is",
        kicker: "Start here",
        description: "What Menoid V1 is, what is live on Monad and Base, its contracts, and what the chain can and cannot see.",
      },
      {
        slug: "key-derivation",
        label: "Key derivation",
        kicker: "One signature, every key",
        description: "How one wallet signature becomes every Menoid key — sk, nk, ivk, ovk and your userCommitment — and why each one exists.",
      },
      {
        slug: "formulas",
        label: "The formulas",
        kicker: "The note model",
        description: "userCommitment, npk, commitment, nullifier, Merkle root, extDataHash, encrypted notes and outgoing records — each with a small example.",
      },
      {
        slug: "registration",
        label: "Registration",
        kicker: "Once per chain",
        description: "The one transaction that registers your private identity and viewing key, and how a sender finds you.",
      },
      {
        slug: "mask",
        label: "Mask",
        kicker: "Public → private",
        description: "Masking, step by step: public tokens become a private note, from your wallet to NoidPool.",
      },
      {
        slug: "send",
        label: "Send",
        kicker: "Private → private",
        description: "A private send, step by step: the proof in your browser, the relayer, and everything NoidPool checks.",
      },
      {
        slug: "swap",
        label: "Swap",
        kicker: "Private → private, another token",
        description: "A private swap, step by step: the pool trades on Uniswap V3 or Capricorn and finishes your new note on-chain.",
      },
      {
        slug: "unmask",
        label: "Unmask",
        kicker: "Private → public",
        description: "Unmasking, step by step: private funds back to any public address, with the recipient locked into the proof.",
      },
      {
        slug: "viewing-keys",
        label: "Viewing keys",
        kicker: "Compliance-friendly by design",
        description: "Viewing keys: show your private activity to anyone you choose, without ever giving away the power to spend.",
      },
      {
        slug: "reference",
        label: "Reference",
        kicker: "For builders",
        description: "Constants, events, the trusted setup, and who controls what in Menoid V1.",
      },
    ],
  },
  "v0.5": {
    id: "v0.5",
    base: "/docs/v0.5",
    label: "V0.5 Testnet",
    short: "V0.5",
    sub: "Extension · 6 testnets",
    pages: [
      {
        slug: "",
        label: "What V0.5 is",
        kicker: "Start here",
        description: "Menoid V0.5: the wallet extension and Android app, Open and Noid modes, on six testnets.",
      },
      {
        slug: "key-derivation",
        label: "Key derivation",
        kicker: "One signature, every key",
        description: "How V0.5 turns one signature of menoid_Wallet into a spending key pair, an encryption key pair and your Noid identity.",
      },
      {
        slug: "formulas",
        label: "The formulas",
        kicker: "The note model",
        description: "V0.5’s userCommitment, commitment, nullifier, Merkle root and encrypted notes — each with a small example.",
      },
      {
        slug: "registration",
        label: "Registration",
        kicker: "Once per chain",
        description: "How a V0.5 wallet registers its Noid identity and encryption key on each chain.",
      },
      {
        slug: "mask",
        label: "Mask (deposit)",
        kicker: "Open → Noid",
        description: "A V0.5 mask, step by step: the deposit proof, the optional relayer fee note, the Merkle tree and the Aptos exception.",
      },
      {
        slug: "send",
        label: "Send (transfer)",
        kicker: "Noid → Noid",
        description: "A V0.5 private send, step by step: batching, the transfer proof, and the relayer and contract checks.",
      },
      {
        slug: "unmask",
        label: "Unmask (withdraw)",
        kicker: "Noid → Open",
        description: "A V0.5 unmask, step by step: the withdraw proof, and a destination bound into the proof.",
      },
      {
        slug: "finding-notes",
        label: "Finding your notes",
        kicker: "Trial decryption",
        description: "How a V0.5 wallet finds its own notes from public events, and how privacy with accountability grew into V1’s viewing keys.",
      },
      {
        slug: "what-changed",
        label: "From V0.5 to V1",
        kicker: "What changed",
        description: "Everything V1 changed from V0.5: wallets, chains, tokens, keys, formulas, swaps, viewing keys and the relayer.",
      },
      {
        slug: "reference",
        label: "Reference",
        kicker: "For builders",
        description: "V0.5 constants, public signals, events and every formula in one place.",
      },
    ],
  },
};

export const pageHref = (book: DocBook, slug: string) => (slug ? `${book.base}/${slug}` : book.base);

export const pageNumber = (index: number) => String(index + 1).padStart(2, "0");

/** The /docs path of a browser path: docs.menoid.xyz serves /docs/mask at /mask. */
export function docsPath(pathname: string) {
  if (pathname === "/docs" || pathname.startsWith("/docs/")) return pathname;
  return pathname === "/" ? "/docs" : `/docs${pathname}`;
}

export function bookFromPath(pathname: string): DocBook {
  return pathname === BOOKS["v0.5"].base || pathname.startsWith(`${BOOKS["v0.5"].base}/`) ? BOOKS["v0.5"] : BOOKS.v1;
}

export const slugFromPath = (book: DocBook, pathname: string) => pathname.slice(book.base.length).replace(/^\/+|\/+$/g, "");

export function locate(version: DocVersion, slug: string) {
  const book = BOOKS[version];
  const index = book.pages.findIndex((p) => p.slug === slug);
  return { book, index, page: book.pages[index], prev: book.pages[index - 1], next: book.pages[index + 1] };
}

/** The same page in the other version when it has one, else that version's first page. */
export function counterpart(version: DocVersion, slug: string) {
  const other = BOOKS[version === "v1" ? "v0.5" : "v1"];
  return { book: other, href: other.pages.some((p) => p.slug === slug) ? pageHref(other, slug) : other.base };
}
