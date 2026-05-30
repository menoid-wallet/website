import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import CountUp from "./CountUp";

const SPECS = [
  { k: "Chain", v: "Monad" },
  { k: "Proof system", v: "Groth16 (snarkjs)" },
  { k: "Commitments", v: "Poseidon" },
  { k: "Note encryption", v: "ECIES" },
  { k: "Custody", v: "Self-custody · local keys" },
  { k: "Distribution", v: "Browser extension (MV3)" },
  { k: "Account types", v: "Open + Noid" },
  { k: "Fee model", v: "1× flat relayer fee" },
];

export default function Chains() {
  return (
    <section id="chains" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.4fr] md:items-center">
          <div>
            <SectionTitle
              eyebrow="Under the hull"
              title={<>Built for Monad. </>}
              highlight="Proven by math."
            />
            <Reveal delay={120}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--ink-soft)]">
                Menoid runs entirely in your browser. Proofs are generated
                locally with snarkjs against audited circuits. No relayer
                ever sees your balance, your recipient, or your route.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <dl className="mt-9 grid max-w-md grid-cols-3 gap-6">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Audits
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-bold text-[var(--ink)]">
                    <CountUp to={2} duration={1600} />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Proof gas
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-bold text-[var(--ink)]">
                    <CountUp to={350} duration={1800} suffix="k" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Open source
                  </dt>
                  <dd className="mt-1 font-display text-3xl font-bold text-[var(--ink)]">
                    <CountUp to={100} duration={1600} suffix="%" />
                  </dd>
                </div>
              </dl>
            </Reveal>

            <a
              href="#download"
              className="link-underline mt-8 inline-flex items-center gap-2 font-semibold text-[var(--ink)]"
            >
              Read the technical docs <span aria-hidden>→</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SPECS.map((s, i) => (
              <Reveal key={s.k} delay={i * 60} variant="scale">
                <div
                  className="card-lift group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(circle at 0% 0%, rgba(212,160,23,0.10), transparent 60%)",
                    }}
                  />
                  <dt className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                    {s.k}
                  </dt>
                  <dd className="relative mt-2 font-display text-lg font-bold leading-tight text-[var(--ink)]">
                    {s.v}
                  </dd>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
