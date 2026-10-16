import path from "node:path";
import type { NextConfig } from "next";

// docs.menoid.xyz: see redirects() and rewrites()
const DOCS_HOST = [{ type: "host" as const, value: "docs.menoid.xyz" }];

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
  // docs.menoid.xyz is the docs without the /docs prefix (/mask is /docs/mask).
  // Links inside the docs still say /docs/…, so on that host they redirect to
  // the short form, which the rewrites below then serve.
  async redirects() {
    return [
      { source: "/docs", has: DOCS_HOST, destination: "/", permanent: false },
      { source: "/docs/:path*", has: DOCS_HOST, destination: "/:path*", permanent: false },
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
        { source: "/", has: DOCS_HOST, destination: "/docs" },
        { source: "/v0.5", has: DOCS_HOST, destination: "/docs/v0.5" },
        { source: "/v0.5/:slug", has: DOCS_HOST, destination: "/docs/v0.5/:slug" },
        // one plain segment is a V1 page; anything with a dot (logos, icons) stays a file.
        // Rewrites chain, so "docs" itself (what "/" just became) is left alone.
        { source: "/:slug((?!docs$)[a-z0-9-]+)", has: DOCS_HOST, destination: "/docs/:slug" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
