import type { Metadata } from "next";

import DownloadModal from "@/components/DownloadModal";
import DocsShell from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: { template: "%s — Menoid Docs", default: "Menoid Docs" },
};

// every docs page shares one frame: header, version switcher, the list of pages
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DocsShell>{children}</DocsShell>
      {/* the V0.5 download sheet — the same one the homepage opens */}
      <DownloadModal />
    </>
  );
}
