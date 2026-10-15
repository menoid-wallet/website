import { ethers } from "ethers";
import { createRequire } from "node:module";


const require = createRequire(import.meta.url);
export const POOL_ABI = require("./abi/NoidPool.json");

/**
 * A JSON-RPC provider for a public endpoint (Monad's, Base's).
 *
 * The endpoint rate-limits ("requests limited to 15/sec") and sits behind a
 * load balancer. So: one request per HTTP call (no batches), at most a few in
 * flight, and rate limits / transient failures retried with backoff. A revert
 * is an answer and is never retried; a signed transaction is only re-sent when
 * the endpoint refused it outright.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RATE_LIMITED = /limit|too many|rate/i;
const TRANSIENT = /timeout|timed out|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|ENOTFOUND|socket hang up|fetch failed|network error|bad gateway|service unavailable|gateway timeout|\b50[234]\b|\b429\b|header not found|block not found/i;

export class ResilientProvider extends ethers.JsonRpcProvider {
  #active = 0;
  #waiting = [];

  constructor(url, chainId, { maxConcurrent = 4, retries = 6 } = {}) {
    const network = ethers.Network.from(chainId);
    super(url, network, { staticNetwork: network, batchMaxCount: 1, pollingInterval: 500 });
    this.maxConcurrent = maxConcurrent;
    this.retries = retries;
  }

  async #acquire() {
    if (this.#active < this.maxConcurrent) {
      this.#active += 1;
      return;
    }
    await new Promise((resolve) => this.#waiting.push(resolve));
  }

  #release() {
    const next = this.#waiting.shift();
    if (next) next();
    else this.#active -= 1;
  }

  async _send(payload) {
    const methods = [].concat(payload).map((p) => p.method);
    const sending = methods.includes("eth_sendRawTransaction");
    for (let attempt = 0; ; attempt++) {
      await this.#acquire();
      let result;
      let failure;
      try {
        result = await super._send(payload);
      } catch (error) {
        failure = error;
      } finally {
        this.#release();
      }

      if (!failure) {
        const limited = result.find((r) => r.error && (r.error.code === -32011 || r.error.code === -32005 || RATE_LIMITED.test(r.error.message || "")));
        if (!limited || attempt >= this.retries) return result;
      } else {
        const text = `${failure.code || ""} ${failure.message || ""}`;
        const retry = sending ? /\b429\b|limit|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(text) : TRANSIENT.test(text);
        if (!retry || attempt >= this.retries) throw failure;
      }
      await sleep(400 * 2 ** attempt + Math.floor(Math.random() * 150));
    }
  }
}

export const poolInterface = new ethers.Interface(POOL_ABI);

/**
 * One chain's connections: `provider` for reads, estimates and sending,
 * `logsProvider` for eth_getLogs (a provider's free tier can cap log ranges
 * far below what the public endpoint allows), and the pool.
 */
export function connectChain(chain) {
  const provider = new ResilientProvider(chain.rpcUrl, chain.chainId);
  const logsProvider = chain.logsRpcUrl === chain.rpcUrl ? provider : new ResilientProvider(chain.logsRpcUrl, chain.chainId);
  const pool = new ethers.Contract(chain.pool, POOL_ABI, provider);

  // read when first needed, so it does not matter when the environment is
  // loaded. Mainnets and testnets never share a relayer key (chain.relayerKeyEnv).
  let signer;
  const relayerSigner = () => {
    if (signer === undefined) {
      const raw = (process.env[chain.relayerKeyEnv] || "").trim();
      const key = raw && !raw.startsWith("0x") ? `0x${raw}` : raw; // with or without 0x
      signer = key ? new ethers.Wallet(key, provider) : null;
    }
    return signer;
  };

  return { chain, provider, logsProvider, pool, relayerSigner };
}

// Error(string) out of whatever shape a revert arrives in
export function revertReason(error) {
  const text = [
    error?.shortMessage,
    error?.reason,
    error?.message,
    error?.info?.error?.message,
    JSON.stringify(error?.info?.error?.data ?? error?.data ?? ""),
  ]
    .filter(Boolean)
    .join(" ");
  const data = text.match(/0x08c379a0[0-9a-fA-F]+/);
  if (data) {
    try {
      return ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + data[0].slice(10))[0];
    } catch {
      // not a well-formed Error(string)
    }
  }
  if (error?.reason) return error.reason;
  const quoted = text.match(/execution reverted: ([^"\\]+)/) || text.match(/reverted with reason string '([^']*)'/);
  if (quoted) return quoted[1];
  return String(error?.shortMessage || error?.message || error).slice(0, 200);
}

export const hex32 = (value) => "0x" + BigInt(value).toString(16).padStart(64, "0");
