import type { Metadata } from "next";

import PrivateApp from "@/components/app/PrivateApp";

export const metadata: Metadata = {
  title: "Menoid — Private Mode",
  description: "Mask, send, swap and unmask privately on Monad. Your keys never leave your browser.",
};

export default function AppPage() {
  return <PrivateApp />;
}
