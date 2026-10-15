import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // token logos (public/tokens) are third-party SVGs: serve them as inert
  // images even if someone opens one directly — no scripts, no requests out
  async headers() {
    return [
      {
        source: "/tokens/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  // app.menoid.xyz is the private app itself (the mainnets): its front page is
  // /app; testnet.menoid.xyz is the testnet one: /testnet. Only the root is
  // rewritten; assets, proving keys (/zk) and logos are shared as is.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", has: [{ type: "host", value: "app.menoid.xyz" }], destination: "/app" },
        { source: "/", has: [{ type: "host", value: "testnet.menoid.xyz" }], destination: "/testnet" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
