/**
 * Groth16 proving in the browser: snarkjs (the same 0.7.6 the protocol repo
 * proves with) loaded once from /zk, the circuits' wasm + proving keys from
 * /zk/v1m. The proving keys are ~18 MB each and are cached by the browser
 * after the first proof.
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

/** Warm the prover (script + proving key) before the user presses the button. */
export function preloadProver(circuit: "transfer" | "withdraw") {
  void loadSnarkjs().catch(() => {});
  void fetch(`/zk/v1m/${circuit}_proof_final.zkey`, { cache: "force-cache" }).catch(() => {});
}

export async function proveInBrowser(circuit: "transfer" | "withdraw", input: Record<string, unknown>): Promise<SolidityProof> {
  const snarkjs = await loadSnarkjs();
  const circuitInput = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, stringify(v)]));
  const { proof } = await snarkjs.groth16.fullProve(circuitInput, `/zk/v1m/${circuit}_proof.wasm`, `/zk/v1m/${circuit}_proof_final.zkey`);
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
