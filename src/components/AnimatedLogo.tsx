"use client";

import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

export default function AnimatedLogo({ className, priority, style }: Props) {
  return (
    <div className={`relative ${className || ""}`} style={style}>
      {/* The base wallet logo image without eyes and smile */}
      <Image
        src="/menoid-logo-blank.png"
        alt="Menoid Logo"
        width={768}
        height={768}
        priority={priority}
        className="h-full w-full block"
      />

      {/* SVG overlay for eyes and smile */}
      <svg
        viewBox="0 0 1024 1024"
        className="absolute inset-0 h-full w-full pointer-events-none"
        aria-hidden
      >
        <defs>
          <linearGradient id="logo-eye-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4d30af" />
            <stop offset="10%" stopColor="#7b5add" />
            <stop offset="30%" stopColor="#8260e4" />
            <stop offset="90%" stopColor="#7d58df" />
          </linearGradient>
          <linearGradient id="logo-smile-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#704bbd" />
            <stop offset="100%" stopColor="#956ff1" />
          </linearGradient>
        </defs>

        {/* Left eye group (blinks) */}
        <g className="logo-eye-left">
          {/* 3D Highlight shadow (white) slightly offset to the left */}
          <rect x="388.5" y="406" width="48" height="100" rx="24" ry="24" fill="#ffffff" />
          {/* Pupil */}
          <rect x="390" y="406" width="48" height="100" rx="24" ry="24" fill="url(#logo-eye-gradient)" />
        </g>

        {/* Right eye group (blinks) */}
        <g className="logo-eye-right">
          {/* 3D Highlight shadow (white) slightly offset to the left */}
          <rect x="583.5" y="406" width="48" height="100" rx="24" ry="24" fill="#ffffff" />
          {/* Pupil */}
          <rect x="585" y="406" width="48" height="100" rx="24" ry="24" fill="url(#logo-eye-gradient)" />
        </g>

        {/* Smile group */}
        <g>
          {/* 3D Highlight shadow (white) slightly shifted down */}
          <path
            d="M 475 516.5 Q 511 550.5 547 516.5"
            fill="none"
            stroke="#ffffff"
            strokeWidth="22"
            strokeLinecap="round"
          />
          {/* Smile mouth */}
          <path
            d="M 475 515 Q 511 549 547 515"
            fill="none"
            stroke="url(#logo-smile-gradient)"
            strokeWidth="22"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
