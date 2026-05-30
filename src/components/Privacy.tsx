import Image from "next/image";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";

const STEPS = [
  {
    n: "01",
    title: "Mask",
    sub: "Deposit MON into the ZK pool",
    body: "Roll two random field elements, build Poseidon commitments for you and the relayer, ECIES-encrypt the notes, then generate a Groth16 proof on-device. Funds leave your Open address as shielded notes.",
    image: "/ship/send_ship.png",
    tag: "~20s · in-browser proof",
  },
  {
    n: "02",
    title: "Noid send",
    sub: "Move shielded value, leave no wake",
    body: "Pick recipients by their Noid public key. The transfer circuit builds nullifiers and new commitments. The chain records a proof, not a path — no one sees who paid whom.",
    image: "/ship/noid_transfer.png",
    tag: "Untraceable on Monad",
  },
  {
    n: "03",
    title: "Unmask",
    sub: "Withdraw back to your Open address",
    body: "Batched up to four notes per proof. Menoid plans the batches, builds the Merkle proofs, and submits a single tx that returns your value — minus one flat relayer fee.",
    image: "/ship/hidden_transfer_successful.png",
    tag: "One flat 0.5 MON fee",
  },
];

export default function Privacy() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 -z-10 h-[60%] -translate-y-1/2 rounded-[48px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(26,20,16,0.04) 30%, rgba(26,20,16,0.06) 70%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle
            eyebrow="The route of a private voyage"
            title={<>Mask. Send. </>}
            highlight="Unmask."
          />
          <Reveal delay={140}>
            <p className="max-w-sm text-[15px] text-[var(--ink-soft)]">
              The whole zk dance happens on your device, in your browser. Your
              keys never leave the extension; your route never leaves your
              head.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} variant="scale">
              <div
                className="card-lift group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper)]"
                style={{ boxShadow: "var(--shadow-md)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--bg-soft)] to-[var(--paper)]">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 100%, rgba(212,160,23,0.18), transparent 60%)",
                    }}
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[var(--ink)]/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--bg)] backdrop-blur">
                    Step {s.n}
                  </div>
                  <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
                    {s.tag}
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <h3 className="font-display text-2xl font-bold leading-tight text-[var(--ink)]">
                    {s.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold-deep)]">
                    {s.sub}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
