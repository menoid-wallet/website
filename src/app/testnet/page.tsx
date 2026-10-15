import type { Metadata } from "next";

import PrivateApp from "@/components/app/PrivateApp";

export const metadata: Metadata = {
  title: "Menoid — Testnet",
  description: "Try Menoid, the compliance-friendly multichain privacy layer, on Monad Testnet and Base Sepolia with free test tokens.",
};

// testnet.menoid.xyz (next.config.ts rewrites its root here)
export default function TestnetPage() {
  return <PrivateApp network="testnet" />;
}
