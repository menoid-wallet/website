const ITEMS = [
  "Self-custody",
  "Zero-knowledge",
  "Open mode",
  "Noid mode",
  "Mask · Unmask",
  "Monad-native",
  "Local proofs",
  "Encrypted notes",
  "No KYC",
  "Open source",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section
      className="relative border-y border-[var(--line)] py-6"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(243,236,219,0.6) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--muted)]">
          ⚓  A wallet that earns its name on every block  ⚓
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
        <div className="flex w-max animate-marquee gap-12 px-6">
          {row.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 whitespace-nowrap font-display text-2xl font-semibold text-[var(--ink-soft)]"
            >
              <span
                className="inline-block h-2 w-2 rotate-45"
                style={{
                  background:
                    "linear-gradient(135deg, #f0d98b 0%, #d4a017 50%, #a87808 100%)",
                  boxShadow: "0 0 8px rgba(212,160,23,0.45)",
                }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
