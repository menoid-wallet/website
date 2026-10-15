import type { Metadata } from "next";

import PrivateApp from "@/components/app/PrivateApp";

export const metadata: Metadata = {
  title: "Menoid — Private Mode",
  description: "Menoid, the compliance-friendly multichain privacy layer: mask, send, swap and unmask privately on Monad and Base. Your keys never leave your browser.",
};

// app.menoid.xyz (next.config.ts rewrites its root here): the mainnets
export default function AppPage() {
  return <PrivateApp />;
}
