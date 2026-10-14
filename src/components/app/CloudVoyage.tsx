"use client";

/* ────────────────────────────────────────────────────────────
   The in-flight pointer (from the extension): a small cloud drifts
   back and forth along a horizon while a transaction is on its way.
   The mascot's "waiting" eyes scan on the same 2.4 s beat, so the
   mark reads as watching the cloud.
   ──────────────────────────────────────────────────────────── */

export default function CloudVoyage({ rain = true }: { rain?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 82, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, height: 1, background: "rgba(78,47,142,0.14)" }} />
      <div className="cv-drift" style={{ position: "absolute", top: 8, width: 72 }}>
        <div className="cv-bob" style={{ position: "relative", filter: "drop-shadow(0 6px 10px rgba(48,26,96,0.22))" }}>
          <svg viewBox="0 0 120 74" width="72" height="44" style={{ display: "block" }}>
            <g fill="#F4EEFF" stroke="rgba(78,47,142,0.14)" strokeWidth="1">
              <ellipse cx="42" cy="44" rx="27" ry="21" />
              <ellipse cx="72" cy="37" rx="31" ry="25" />
              <ellipse cx="95" cy="47" rx="21" ry="17" />
              <rect x="30" y="44" width="72" height="22" rx="11" />
            </g>
            <ellipse cx="64" cy="31" rx="18" ry="9" fill="rgba(255,255,255,0.75)" />
          </svg>
          {rain && (
            <svg viewBox="0 0 120 40" width="72" height="24" className="cv-rain-lean" style={{ position: "absolute", top: 42, left: 0, transformOrigin: "top center" }}>
              {[20, 40, 60, 80, 100].map((x, i) => (
                <line key={i} className="cv-rain" style={{ animationDelay: `${i * 0.16}s` }} x1={x} y1="0" x2={x} y2="15" stroke="#B9A6E8" strokeWidth="3" strokeLinecap="round" />
              ))}
            </svg>
          )}
        </div>
      </div>
      <style>{`
        @keyframes cvDrift { 0%, 100% { left: 6%; } 50% { left: calc(94% - 72px); } }
        .cv-drift { animation: cvDrift 2.4s ease-in-out infinite; left: 6%; }
        @keyframes cvBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .cv-bob { animation: cvBob 1.7s ease-in-out infinite; }
        @keyframes cvRain { 0% { opacity: 0; transform: translateY(-6px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(12px); } }
        .cv-rain { animation: cvRain 0.9s linear infinite; }
        @keyframes cvRainLean { 0%, 50%, 100% { transform: skewX(0deg); } 25% { transform: skewX(-20deg); } 75% { transform: skewX(20deg); } }
        .cv-rain-lean { animation: cvRainLean 2.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
