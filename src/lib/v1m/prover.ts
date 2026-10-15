/**
 * Groth16 proving in the browser: snarkjs (the same 0.7.6 the protocol repo
 * proves with) loaded once from /zk, the circuits' wasm from /zk/v1m, and the
 * proving keys of the chain's setup:
 *
 *   testnet   /zk/v1m/*_proof_final.zkey          development setup (one contributor)
 *   mainnet   /zk/v1m/mainnet/*_proof_final.zkey  the ceremony (scripts/ceremony.js)
 *
 * A proof made with one setup's key only verifies against that setup's
 * verifier contract. The keys are ~18 MB each and cached after the first proof.
 */
import type { SolidityProof } from "./build.ts";

type Snarkjs = {
  groth16: {
    fullProve: (input: Record<string, unknown>, wasm: string, zkey: string) => Promise<{ proof: { pi_a: string[]; pi_b: string[][]; pi_c: string[] } }>;
  };
};

let loading: Promise<Snarkjs> | null = null;

function loadSnarkjs(): Promise<Snarkjs> {
  const w = window as unknown as { snarkjs?: Snarkjs };
  if (w.snarkjs) return Promise.resolve(w.snarkjs);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/zk/snarkjs.min.js";
      script.async = true;
      script.onload = () => (w.snarkjs ? resolve(w.snarkjs) : reject(new Error("snarkjs did not load")));
      script.onerror = () => {
        loading = null;
        reject(new Error("Could not load the prover. Check your connection."));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

const stringify = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(stringify) : typeof v === "bigint" || typeof v === "number" ? v.toString() : v;

export type ProvingKeys = "testnet" | "mainnet";
const zkeyUrl = (circuit: string, keys: ProvingKeys) => `/zk/v1m/${keys === "mainnet" ? "mainnet/" : ""}${circuit}_proof_final.zkey`;

/** Warm the prover (script + proving key) before the user presses the button. */
export function preloadProver(circuit: "transfer" | "withdraw", keys: ProvingKeys = "testnet") {
  void loadSnarkjs().catch(() => {});
  void fetch(zkeyUrl(circuit, keys), { cache: "force-cache" }).catch(() => {});
}

export async function proveInBrowser(circuit: "transfer" | "withdraw", input: Record<string, unknown>, keys: ProvingKeys = "testnet"): Promise<SolidityProof> {
  const snarkjs = await loadSnarkjs();
  const circuitInput = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, stringify(v)]));
  const { proof } = await snarkjs.groth16.fullProve(circuitInput, `/zk/v1m/${circuit}_proof.wasm`, zkeyUrl(circuit, keys));
  // G2 coordinates swapped for the Solidity verifier
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
  };
}
