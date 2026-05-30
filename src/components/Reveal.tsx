"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "rise" | "blur" | "scale";

export default function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "rise",
  as: Tag = "div",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: Variant;
  as?: React.ElementType;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            window.setTimeout(() => setShown(true), delay);
            if (once) io.disconnect();
          } else if (!once) {
            setShown(false);
          }
        }
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [delay, once]);

  const base =
    variant === "blur"
      ? "reveal-blur"
      : variant === "scale"
        ? "reveal-scale"
        : "reveal";

  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref as never} className={`${base} ${shown ? "in" : ""} ${className}`}>
      {children}
    </Comp>
  );
}

/* Stagger helper — wraps direct children and applies sequential delays */
export function Stagger({
  children,
  step = 90,
  startAt = 0,
  variant = "rise",
  className = "",
}: {
  children: React.ReactNode;
  step?: number;
  startAt?: number;
  variant?: Variant;
  className?: string;
}) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {items.map((node, i) => (
        <Reveal key={i} delay={startAt + i * step} variant={variant}>
          {node}
        </Reveal>
      ))}
    </div>
  );
}
