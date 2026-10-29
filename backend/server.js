import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5010;

// ── CORS — only these origins may call the API ──
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://menoid.xyz",
  "https://www.menoid.xyz",
  "https://app.menoid.xyz",
  "https://testnet.menoid.xyz",
  // more sites (a Vercel preview, testnet.menoid.xyz …) without a code change:
  // CORS_ORIGINS=https://a.example,https://b.example
  ...(process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (curl, health checks, server-to-server)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/", (_req, res) => res.json({ status: "Menoid API is running ⚓" }));

// ───────────────────── Menoid v1-mainnet (/api/v1m) ─────────────────────
// Private app backend: chain indexer + relayer. Loaded after dotenv so its
// relayer key and RPC settings are in the environment.
const { mountV1Mainnet, startV1Mainnet } = await import("./v1mainnet/index.js");
mountV1Mainnet(app);

// ───────────────────────── Start ─────────────────────────
// On Vercel the app is one function that answers requests: no port, no
// background work. Anywhere else it is a normal long-running server.
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`✓ Menoid API on http://localhost:${PORT}`));
  startV1Mainnet();
}

export default app;
