"use client";

/* ────────────────────────────────────────────────────────────
   The Menoid mark, alive — ported from the wallet extension.
   The body is the flat artwork with no face; the eyes and smile are
   SVG over it so they can move:
     sleeping — eyes shut, floating, "z z z"
     awake    — pops awake with a big smile (something to do)
     waiting  — eyes scan side to side, watching the voyage cloud
     wink     — the "done" beat: one eye winks with a shine
     idle     — the site's double blink
   ──────────────────────────────────────────────────────────── */

export type MascotMood = "idle" | "sleeping" | "awake" | "waiting" | "wink";

const EYE_L = { x: 295.1, y: 323.6, w: 85.3, h: 177.8 };
const EYE_R = { x: 641.8, y: 323.6, w: 85.3, h: 177.8 };
const EYE_RADIUS = 42.7;

export default function Mascot({ mood = "idle", className = "", style }: { mood?: MascotMood; className?: string; style?: React.CSSProperties }) {
  const sleeping = mood === "sleeping";
  const waiting = mood === "waiting";
  const wink = mood === "wink";
  const awake = mood === "awake";
  const blinking = awake || mood === "idle";

  const eye = (e: typeof EYE_L, blinkClass: string) => (
    <g className={waiting ? "ms-scan" : undefined}>
      <g className="ms-lid" style={{ transform: `scaleY(${sleeping ? 0.07 : 1})` }}>
        <g className={blinkClass}>
          <rect x={e.x - 2.7} y={e.y} width={e.w} height={e.h} rx={EYE_RADIUS} ry={EYE_RADIUS} fill="#ffffff" />
          <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={EYE_RADIUS} ry={EYE_RADIUS} fill="url(#ms-eye)" />
        </g>
      </g>
    </g>
  );

  return (
    <div className={`relative ${className} ${sleeping ? "ms-sleep-float" : awake ? "ms-wake" : ""}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/app/menoid-logo-blank.png" alt="Menoid" draggable={false} className="block h-full w-full select-none" />
      <svg viewBox="0 0 1024 1024" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="ms-eye" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4d30af" />
            <stop offset="10%" stopColor="#7b5add" />
            <stop offset="30%" stopColor="#8260e4" />
            <stop offset="90%" stopColor="#7d58df" />
          </linearGradient>
          <linearGradient id="ms-smile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#704bbd" />
            <stop offset="100%" stopColor="#956ff1" />
          </linearGradient>
          <radialGradient id="ms-glow">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#E4D6FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#C9B0FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {wink && <circle className="ms-shine" cx="335" cy="395" r="120" fill="url(#ms-glow)" />}
        {eye(EYE_L, wink ? "ms-winkfast" : blinking ? "ms-blink" : "")}
        {eye(EYE_R, wink ? "" : blinking ? "ms-blink" : "")}

        {sleeping ? (
          <g className="ms-snore">
            <ellipse cx="510" cy="548" rx="30" ry="23" fill="url(#ms-smile)" />
            <ellipse cx="500" cy="540" rx="9" ry="6" fill="#ffffff" opacity="0.4" />
          </g>
        ) : (
          <g>
            <path d="M 446.2 520 Q 510.2 580.4 574.2 520" fill="none" stroke="#ffffff" strokeWidth="39.1" strokeLinecap="round" />
            <path d="M 446.2 517.3 Q 510.2 577.8 574.2 517.3" fill="none" stroke="url(#ms-smile)" strokeWidth="39.1" strokeLinecap="round" />
          </g>
        )}

        {wink && <path className="ms-twinkle" d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z" fill="#E3D3FF" />}

        {sleeping && (
          <g fill="url(#ms-eye)" fontFamily="Fredoka, ui-rounded, system-ui" fontWeight="700">
            <text className="ms-z" style={{ animationDelay: "0s" }} x="690" y="300" fontSize="70">z</text>
            <text className="ms-z" style={{ animationDelay: "0.55s" }} x="748" y="250" fontSize="52">z</text>
            <text className="ms-z" style={{ animationDelay: "1.1s" }} x="792" y="212" fontSize="38">z</text>
          </g>
        )}
      </svg>

      <style>{`
        @keyframes ms-scan { 0%,100% { transform: translate(-34px, 16px); } 50% { transform: translate(34px, 16px); } }
        .ms-scan { animation: ms-scan 2.4s ease-in-out infinite; }
        .ms-lid { transform-box: fill-box; transform-origin: center; transition: transform 480ms cubic-bezier(0.34, 1.64, 0.5, 1); }
        @keyframes ms-blink { 0%, 2%, 6%, 10%, 100% { transform: scaleY(1); } 4%, 8% { transform: scaleY(0.12); } }
        .ms-blink { transform-box: fill-box; transform-origin: center; animation: ms-blink 3s infinite; }
        @keyframes ms-winkfast { 0%, 20%, 26%, 100% { transform: scaleY(1); } 23% { transform: scaleY(0.08); } }
        .ms-winkfast { transform-box: fill-box; transform-origin: center; animation: ms-winkfast 2.2s cubic-bezier(0.4,0,0.3,1) 0.2s infinite; }
        @keyframes ms-sleep-float { 0%,100% { transform: translateY(0) rotate(-1.6deg); } 50% { transform: translateY(-5%) rotate(1.6deg); } }
        .ms-sleep-float { animation: ms-sleep-float 3.6s ease-in-out infinite; }
        @keyframes ms-snore { 0%,100% { transform: scaleY(0.8); } 45% { transform: scaleY(1.2); } }
        .ms-snore { transform-box: fill-box; transform-origin: center; animation: ms-snore 3.6s ease-in-out infinite; }
        @keyframes ms-wake { 0% { transform: translateY(7%) scale(0.9); } 45% { transform: translateY(-5%) scale(1.08); } 72% { transform: translateY(1.5%) scale(0.98); } 100% { transform: none; } }
        .ms-wake { animation: ms-wake 640ms cubic-bezier(0.34,1.58,0.6,1) both; }
        @keyframes ms-shine { 0%,16% { opacity: 0; transform: scale(0.2); } 42% { opacity: 0.85; transform: scale(1.1); } 100% { opacity: 0; transform: scale(1.55); } }
        .ms-shine { transform-box: fill-box; transform-origin: center; animation: ms-shine 1.6s ease-out 0.3s infinite; }
        @keyframes ms-twinkle { 0%, 42%, 88%, 100% { opacity: 0; transform: translate(252px,300px) scale(0.3) rotate(-30deg); } 60% { opacity: 1; transform: translate(252px,300px) scale(1.25) rotate(0deg); } 74% { opacity: 0.85; transform: translate(252px,300px) scale(0.95) rotate(10deg); } }
        .ms-twinkle { animation: ms-twinkle 1.6s ease-out 0.28s infinite; }
        @keyframes ms-z { 0% { opacity: 0; transform: translateY(8px) scale(0.85); } 25% { opacity: 0.95; } 100% { opacity: 0; transform: translateY(-26px) scale(1.15); } }
        .ms-z { animation: ms-z 2.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
