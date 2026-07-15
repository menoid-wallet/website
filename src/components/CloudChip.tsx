"use client";

/* ────────────────────────────────────────────────────────────
   A little cloud to sit things in.
   Lobes are opaque and share the body's colour, so they merge
   into one silhouette with no seams; the drop-shadow goes on the
   backdrop wrapper so it traces the union rather than any single
   piece — and so it never lands on the text inside.
   Widths are percentages: on a narrow chip the lobes come out
   round, on a wide one they stretch into softer billows, and both
   read as cloud at this size.
   ──────────────────────────────────────────────────────────── */

const LOBES: [number, number, number, "top" | "bottom"][] = [
  [16, 34, 22, "top"], [45, 38, 26, "top"], [76, 32, 20, "top"],
  [27, 32, 20, "bottom"], [58, 36, 23, "bottom"], [86, 28, 17, "bottom"],
];

export default function CloudChip({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "violet";
  className?: string;
}) {
  const bg = tone === "violet" ? "#5E40A8" : "#F6EFFF";

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ filter: "drop-shadow(0 5px 12px rgba(64,36,122,0.26))" }}
      >
        {LOBES.map(([left, width, height, edge], i) => (
          <span
            key={i}
            className="absolute rounded-[50%]"
            style={{
              left: `${left}%`,
              width: `${width}%`,
              height,
              background: bg,
              [edge]: -height * 0.38,
              transform: "translateX(-50%)",
            }}
          />
        ))}
        {/* the body last, so it covers where the lobes meet it */}
        <span className="absolute inset-0 rounded-full" style={{ background: bg }} />
      </span>
      <span className="relative flex items-center">{children}</span>
    </span>
  );
}
