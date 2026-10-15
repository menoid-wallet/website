import express from "express";
import mongoose from "mongoose";
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

// ───────────────────────── Model ─────────────────────────
const registrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional social handles
    x: { type: String, trim: true, default: "" },
    telegram: { type: String, trim: true, default: "" },
    discord: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// Keep the model name "Email" so it maps to the existing `emails` collection.
const Email = mongoose.model("Email", registrationSchema);

// ───────────────────────── Routes ─────────────────────────

// Get all registrations on the waitlist
app.get("/api/emails", async (_req, res) => {
  try {
    const docs = await Email.find().sort({ createdAt: -1 });
    res.json({
      count: docs.length,
      // Kept for backwards compatibility (the frontend uses this to flag duplicates)
      emails: docs.map((d) => d.email),
      registrations: docs.map((d) => ({
        fullName: d.fullName || "",
        email: d.email,
        x: d.x || "",
        telegram: d.telegram || "",
        discord: d.discord || "",
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/emails]", err);
    res.status(500).json({ error: "Failed to fetch registrations." });
  }
});

// Join the waitlist
app.post("/api/joinwaitlist", async (req, res) => {
  try {
    const { fullName, email, x, telegram, discord } = req.body ?? {};

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return res.status(400).json({ error: "Please enter your full name." });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await Email.findOne({ email: normalized });
    if (existing) {
      return res
        .status(200)
        .json({ joined: false, message: "You're already on the crew! We'll be in touch soon." });
    }

    // Optional fields — store trimmed strings (empty when not provided)
    const clean = (v) => (typeof v === "string" ? v.trim() : "");

    await Email.create({
      fullName: fullName.trim(),
      email: normalized,
      x: clean(x),
      telegram: clean(telegram),
      discord: clean(discord),
    });
    return res
      .status(201)
      .json({ joined: true, message: "Welcome aboard! You're on the waitlist." });
  } catch (err) {
    // Duplicate key (race condition) — treat as already joined
    if (err?.code === 11000) {
      return res
        .status(200)
        .json({ joined: false, message: "You're already on the crew! We'll be in touch soon." });
    }
    console.error("[POST /api/joinwaitlist]", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.get("/", (_req, res) => res.json({ status: "Menoid waitlist API is running ⚓" }));

// ───────────────────── Menoid v1-mainnet (/api/v1m) ─────────────────────
// Private app backend: chain indexer + relayer. Loaded after dotenv so its
// relayer key and RPC settings are in the environment.
const { mountV1Mainnet, startV1Mainnet } = await import("./v1mainnet/index.js");
mountV1Mainnet(app);

// ───────────────────────── Start ─────────────────────────
const waitlistDbOk = await mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✓ MongoDB connected");
    return true;
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    return false;
  });

// Without its database the waitlist cannot work; keep serving only if the
// v1-mainnet API has a database of its own.
if (!waitlistDbOk && !process.env.V1M_MONGODB_URI) process.exit(1);
app.listen(PORT, () => console.log(`✓ Menoid waitlist API on http://localhost:${PORT}`));
startV1Mainnet();
