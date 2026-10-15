"use client";

import { openDownload } from "@/components/DownloadModal";

// opens the same download sheet as the homepage (mounted on the V0.5 docs page)
export default function DownloadV05({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <button type="button" onClick={openDownload} className={className} style={style}>
      {children}
    </button>
  );
}
