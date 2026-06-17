import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ───────────────────────── Model ─────────────────────────
const emailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Email = mongoose.model("Email", emailSchema);

// ───────────────────────── Routes ─────────────────────────

// Get all emails on the waitlist
app.get("/api/emails", async (_req, res) => {
  try {
    const docs = await Email.find().sort({ createdAt: -1 });
    res.json({ count: docs.length, emails: docs.map((d) => d.email) });
  } catch (err) {
    console.error("[GET /api/emails]", err);
    res.status(500).json({ error: "Failed to fetch emails." });
  }
});

// Join the waitlist
app.post("/api/joinwaitlist", async (req, res) => {
  try {
    const { email } = req.body ?? {};
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

    await Email.create({ email: normalized });
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

// ───────────────────────── Start ─────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✓ MongoDB connected");
    app.listen(PORT, () => console.log(`✓ Menoid waitlist API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err.message);
    process.exit(1);
  });
