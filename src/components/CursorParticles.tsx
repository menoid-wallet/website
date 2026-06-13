"use client";

import { useEffect, useRef, useState } from "react";

interface Flake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotationAngle: number;
  rotationSpeed: number;
  baseSpring: number;
  baseFriction: number;
  color: string;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  noiseOffset: number;
  isFallenState?: boolean; // Tracks if this flake has crossed the bottom wall and fallen
}

interface CursorParticlesProps {
  zIndexClass?: string;
  isLoader?: boolean; // If true, disables the falling wall physics for loader viewport swarming
}

export default function CursorParticles({ zIndexClass = "z-[2]", isLoader = false }: CursorParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);
  const isFallingRef = useRef(false); // Default to swarming hover state
  const hasMovedRef = useRef(false);
  
  // Cache the last screen client X/Y coordinates to track scrolling updates
  const lastClientXRef = useRef(0);
  const lastClientYRef = useRef(0);
  
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // 1. Detect if the device has a precision pointer (mouse)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handleDeviceChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsEnabled(e.matches);
    };

    handleDeviceChange(mediaQuery);
    mediaQuery.addEventListener("change", handleDeviceChange);

    return () => {
      mediaQuery.removeEventListener("change", handleDeviceChange);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const flakes: Flake[] = [];
    const numFlakes = 135; // Density suited for a large viewport spread

    // Palette: Noid Mode dark tones (inks and golds)
    const flakeColors = [
      "rgba(21, 15, 11, 0.72)",   // Deep Noid Ink
      "rgba(36, 26, 18, 0.68)",   // Umber
      "rgba(60, 44, 30, 0.65)",   // Coffee Brown
      "rgba(163, 110, 20, 0.55)",  // Muted Gold
    ];

    // Resize canvas to fill the parent container client area
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize pointer coordinates at center of viewport
    const initialX = canvas.width / 2;
    const initialY = canvas.height / 2;
    mouseRef.current = { x: initialX, y: initialY };
    targetMouseRef.current = { x: initialX, y: initialY };
    
    lastClientXRef.current = window.innerWidth / 2;
    lastClientYRef.current = window.innerHeight / 2;

    // Initialize particles at the center of the canvas
    for (let i = 0; i < numFlakes; i++) {
      const colorRandom = Math.random();
      let color = flakeColors[0];
      if (colorRandom > 0.85) {
        color = flakeColors[3]; // 15% gold accents
      } else if (colorRandom > 0.6) {
        color = flakeColors[2]; // 25% coffee brown
      } else if (colorRandom > 0.35) {
        color = flakeColors[1]; // 25% umber
      }

      flakes.push({
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        width: Math.random() * 2 + 1.6, // 1.6px to 3.6px wide flakes
        height: Math.random() * 5 + 3.8, // 3.8px to 8.8px long flakes
        rotationAngle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        // Loose spring physics for fluid swarming
        baseSpring: Math.random() * 0.007 + 0.0035, // 0.0035 to 0.0105 spring stiffness
        baseFriction: Math.random() * 0.02 + 0.93, // 0.93 to 0.95 slow decay damping
        color,
        // Large spread area: extends from 80px to 450px around the cursor
        orbitRadius: Math.random() * 370 + 80,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
        noiseOffset: Math.random() * 100,
        isFallenState: false,
      });
    }


    // Pointer move listener relative to canvas bounds (handles page scrolling natively)
    const handlePointerMove = (e: PointerEvent) => {
      lastClientXRef.current = e.clientX;
      lastClientYRef.current = e.clientY;

      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
      }
      targetMouseRef.current = { x: localX, y: localY };

      // Determine if cursor is inside the canvas boundaries
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isFallingRef.current = !isInside;
    };

    // Track scroll events to detect if the container scrolled out from under the cursor
    const handleScroll = () => {
      const rect = canvas.getBoundingClientRect();
      const localX = lastClientXRef.current - rect.left;
      const localY = lastClientYRef.current - rect.top;
      targetMouseRef.current = { x: localX, y: localY };

      const isInside =
        lastClientXRef.current >= rect.left &&
        lastClientXRef.current <= rect.right &&
        lastClientYRef.current >= rect.top &&
        lastClientYRef.current <= rect.bottom;

      isFallingRef.current = !isInside;
    };

    // Track when hovering over clickable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isClickable =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        !!target.closest("a") ||
        !!target.closest("button") ||
        target.getAttribute("role") === "button" ||
        window.getComputedStyle(target).cursor === "pointer";

      isHoveringRef.current = isClickable;
    };

    const handlePointerLeave = () => {
      isFallingRef.current = true; // Fall to bottom if mouse leaves the page/viewport
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("pointerleave", handlePointerLeave);

    // Physics + Render loop
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly interpolate current mouse to target mouse for spring prep
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.12;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.12;

      const time = Date.now() * 0.001;

      flakes.forEach((f) => {
        // Orbit angle update
        f.orbitAngle += f.orbitSpeed;
        f.rotationAngle += f.rotationSpeed;

        const floor = canvas.height - f.height;

        // Determine if we should use gravity (falling) or spring swarm physics
        const useGravity = !isLoader && isFallingRef.current;

        if (useGravity) {
          // gravity physics: particles detach from cursor and fall/settle at the bottom
          f.vy += 0.24; // constant gravity pull
          f.vx *= 0.98; // slight air resistance horizontal drag
          f.vy *= 0.98; // slight air resistance vertical drag

          f.x += f.vx;
          f.y += f.vy;
        } else {
          // standard spring swarm physics
          const activeRadius = isHoveringRef.current ? f.orbitRadius * 0.16 : f.orbitRadius;
          const activeSpring = isHoveringRef.current ? f.baseSpring * 3.2 : f.baseSpring;
          const activeFriction = isHoveringRef.current ? f.baseFriction * 0.95 : f.baseFriction;

          // Calculate specific orbital target position around the cursor
          // Adding sinusoidal scale fluctuations to make it feel spongy, fluid, and breathing
          const pulse = Math.sin(time * 1.2 + f.noiseOffset) * 8;
          const targetX = mouseRef.current.x + Math.cos(f.orbitAngle) * (activeRadius + pulse);
          const targetY = mouseRef.current.y + Math.sin(f.orbitAngle) * (activeRadius + pulse);

          // Distance vector
          const dx = targetX - f.x;
          const dy = targetY - f.y;

          // Apply Hooke's spring force
          f.vx += dx * activeSpring;
          f.vy += dy * activeSpring;

          // Apply friction damping
          f.vx *= activeFriction;
          f.vy *= activeFriction;

          // Update coordinates
          f.x += f.vx;
          f.y += f.vy;
        }

        // Strict boundary: clamp Y to floor
        if (!isLoader && f.y >= floor) {
          f.y = floor;
          if (f.vy > 0) {
            f.vy = -f.vy * 0.1; // soft damp bounce
            f.vx *= 0.8; // floor friction
          }
        }

        // Draw flake as a rotated rectangle (just like google antigravity website)
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotationAngle + f.orbitAngle * 0.5);
        ctx.fillStyle = f.color;
        ctx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${zIndexClass} h-full w-full select-none animate-fade-in`}
      style={{ mixBlendMode: "multiply" }}
    />
  );
}
