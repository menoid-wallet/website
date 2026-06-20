import Image from "next/image";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import CountUp from "./CountUp";

export default function Modes() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          eyebrow="Two modes, one wallet"
          title={
            <>
              Sail in the open, or sail in the{" "}
            </>
          }
          highlight="shadow waters."
        />

        <Reveal delay={120}>
          <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">
            Menoid carries two accounts at once. Flip between them in a tap —
            your{" "}
            <strong className="font-semibold text-[var(--ink)]">Open</strong>{" "}
            address for everyday tx, your{" "}
            <strong className="font-semibold text-[var(--ink)]">Noid</strong>{" "}
            account for zero-knowledge transfers.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Open mode */}
          <Reveal variant="scale">
            <div
              className="card-lift group relative h-full overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-8"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              {/* corner stamp */}
              <span
                className="absolute right-6 top-6 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)]"
              >
                Normal · EOA
              </span>

              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--gold-deep)]">
                01 · Open Mode
              </p>
              <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-[var(--ink)]">
                A clean account for everyday MON.
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--ink-soft)]">
                Receive, send, and explore Monad with self-custody. Keys live
                on your device — Menoid never sees them.
              </p>

              {/* balance mock */}
              <div
                className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5"
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Open balance
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                    0xA1c…9F2e
                  </div>
                </div>
                <div className="mt-2 font-display text-[40px] font-black leading-none tracking-[-0.02em] text-[var(--ink)]">
                  <CountUp to={482.1} duration={1800} decimals={2} />{" "}
                  <span className="text-[var(--muted)]">MON</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="btn-spring rounded-full bg-[var(--ink)] px-3 py-1.5 text-[11px] font-semibold text-[var(--bg)]">
                    Send
                  </span>
                  <span className="btn-spring rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[11px] font-semibold text-[var(--ink-soft)]">
                    Receive
                  </span>
                  <span className="btn-spring rounded-full border border-[var(--line)] bg-[var(--gold-pale)] px-3 py-1.5 text-[11px] font-semibold text-[var(--gold-deep)]">
                    Mask →
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Noid mode — dark luxury */}
          <Reveal variant="scale" delay={120}>
            <div
              className="card-lift group relative h-full overflow-hidden rounded-3xl bg-[var(--ink)] p-8"
              style={{ boxShadow: "var(--shadow-noid)" }}
            >
              {/* gold glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(240,217,139,0.32) 0%, rgba(212,160,23,0.10) 40%, transparent 70%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-20 h-[240px] w-[240px] rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(192,56,26,0.18) 0%, transparent 70%)",
                }}
              />

              <span
                className="relative rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold-soft)]"
                style={{ position: "absolute", right: "1.5rem", top: "1.5rem" }}
              >
                Private · ZK
              </span>

              <p className="relative font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]">
                02 · Noid Mode
              </p>
              <h3 className="relative mt-2 font-display text-3xl font-bold leading-tight text-[var(--bg)]">
                A ZK account in the shadow waters.
              </h3>
              <p className="relative mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
                Funds live as Poseidon commitments inside a Groth16 pool.
                Proofs are generated on your device, not a server.
              </p>

              <div
                className="relative mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Shielded balance
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                    noid_xpub · ✦
                  </div>
                </div>
                <div className="mt-2 font-display text-[40px] font-black leading-none tracking-[-0.02em] text-[var(--bg)]">
                  ••• <span className="text-[var(--gold-soft)]">MON</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="btn-spring rounded-full bg-[var(--gold)] px-3 py-1.5 text-[11px] font-semibold text-[var(--ink)]">
                    Noid send
                  </span>
                  <span className="btn-spring rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/80">
                    Receive
                  </span>
                  <span className="btn-spring rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-[var(--gold-soft)]">
                    Unmask ←
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Showcase strip */}
        <Reveal delay={180} className="mt-8">
          <div
            className="relative overflow-hidden rounded-[36px] border border-[var(--line)] bg-gradient-to-br from-[var(--paper)] via-[var(--paper)] to-[var(--bg-soft)]"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-[1.1fr_1fr]">
              <div className="relative p-8 md:p-12">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--gold-deep)]">
                  ✦ One tap to switch
                </p>
                <h3 className="mt-3 font-display text-[clamp(30px,4vw,52px)] font-black leading-[1.05] tracking-[-0.02em] text-[var(--ink)]">
                  Meno is always at the helm.
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  The mode switch lives at the top of the wallet. Open shows
                  your public address; Noid morphs the UI into shadow waters —
                  dark luxury, gold accents, full privacy.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {["Self-custody", "Local proofs", "Encrypted notes", "Audited circuits"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--ink-soft)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <dl className="mt-9 grid max-w-md grid-cols-3 gap-6">
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      Proofs / sec
                    </dt>
                    <dd className="mt-1 font-display text-2xl font-bold text-[var(--ink)]">
                      <CountUp to={1.0} duration={1600} decimals={1} />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      Circuit depth
                    </dt>
                    <dd className="mt-1 font-display text-2xl font-bold text-[var(--ink)]">
                      <CountUp to={20} duration={1600} />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      Open-source
                    </dt>
                    <dd className="mt-1 font-display text-2xl font-bold text-[var(--ink)]">
                      <CountUp to={100} duration={1600} suffix="%" />
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="relative min-h-[340px] overflow-hidden md:min-h-[440px]">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 50%, rgba(212,160,23,0.30), transparent 60%), radial-gradient(circle at 80% 80%, rgba(26,20,16,0.10), transparent 60%)",
                  }}
                />
                <Image
                  src="/meno/meno_with_wallet.webp"
                  alt="Meno holding a wallet"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-contain p-6 gentle-bob"
                />
                <div
                  className="absolute right-6 top-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)]/90 px-3 py-2 backdrop-blur"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    Mode
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[var(--ink)]">
                    Open ⇄ Noid
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
