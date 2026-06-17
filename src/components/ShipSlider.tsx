"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export type SliderPhase = "idle" | "submitting" | "success" | "error";

interface ShipSliderProps {
  canSubmit: boolean;
  phase: SliderPhase;
  onCommit: () => void;
  /** Label shown when the slider is disabled (e.g. "Enter your email to sail"). */
  disabledLabel?: string;
}

const THUMB_W = 52;
const COMMIT_THRESHOLD = 0.88;

/**
 * Drag-the-ship slider — adapted from the Menoid wallet's SendModal.
 * Light (parchment) theme; uses /ship/ship.png as the thumb.
 */
export default function ShipSlider({
  canSubmit,
  phase,
  onCommit,
  disabledLabel = "Enter your email to sail",
}: ShipSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);
  const committed = useRef(false);

  const disabled = !canSubmit || phase === "submitting" || phase === "success";
  // The slider always *looks* active — it just won't move until the email is valid.
  const canDrag = canSubmit;

  // Reset whenever we return to an interactive state (idle or after an error).
  useEffect(() => {
    if (phase === "idle" || phase === "error") {
      committed.current = false;
      setProgress(0);
      setDragging(false);
    }
  }, [phase]);

  const getTrackWidth = () => trackRef.current?.clientWidth ?? 280;
  const clampP = (raw: number) => Math.max(0, Math.min(1, raw));

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || committed.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      dragStartX.current = e.clientX;
      dragStartProgress.current = progress;
    },
    [disabled, progress]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || disabled || committed.current) return;
      const travelW = getTrackWidth() - THUMB_W;
      const delta = e.clientX - dragStartX.current;
      const newProgress = clampP(dragStartProgress.current + delta / travelW);
      setProgress(newProgress);
      if (newProgress >= COMMIT_THRESHOLD && !committed.current) {
        committed.current = true;
        setProgress(1);
        setDragging(false);
        onCommit();
      }
    },
    [dragging, disabled, onCommit]
  );

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    if (!committed.current) setProgress(0);
  }, [dragging]);

  const travelW = Math.max(1, (trackRef.current?.clientWidth ?? 280) - THUMB_W);
  const thumbX = progress * travelW;

  let fillColor = "rgba(163,110,20,0.08)";
  let shipFilter = "none";
  if (phase === "submitting") {
    fillColor = "rgba(218,162,28,0.24)";
    shipFilter = "drop-shadow(0 0 6px rgba(218,162,28,0.6))";
  } else if (phase === "success") {
    fillColor = "rgba(5,150,105,0.18)";
  } else if (canSubmit && progress > 0) {
    fillColor = `rgba(218,162,28,${0.08 + progress * 0.2})`;
  }

  let fillExtra = 0;
  let trackLabel = "";
  if (phase === "submitting") {
    trackLabel = "Boarding the crew…";
    fillExtra = 9999;
  } else if (phase === "success") {
    trackLabel = "Aboard! ⚓";
    fillExtra = 9999;
  } else if (!canSubmit) {
    trackLabel = disabledLabel;
  } else if (progress > 0.55) {
    trackLabel = "Release to join!";
  } else {
    trackLabel = "Drag the ship to join →";
  }

  const labelColor =
    phase === "success"
      ? "rgba(5,150,105,0.85)"
      : phase === "submitting"
      ? "rgba(163,110,20,0.95)"
      : "rgba(23,19,17,0.5)";

  return (
    <div
      ref={trackRef}
      style={{
        position: "relative",
        width: "100%",
        height: 56,
        borderRadius: 28,
        border:
          phase === "success"
            ? "1.5px solid rgba(5,150,105,0.35)"
            : canSubmit
            ? "1.5px solid rgba(218,162,28,0.45)"
            : "1.5px solid rgba(163,110,20,0.22)",
        background: phase === "success" ? "#EAF6F0" : "#FAF5E8",
        boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset",
        overflow: "hidden",
        cursor: disabled ? "not-allowed" : "default",
        userSelect: "none",
        transition: "border-color 0.3s ease, background 0.3s ease",
      }}
    >
      {/* Wave fill */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: fillColor,
          width: `${thumbX + fillExtra + 26 + THUMB_W / 2}px`,
          borderRadius: "inherit",
          transition: dragging
            ? "none"
            : "width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.4s ease",
          pointerEvents: "none",
        }}
      />

      {/* Ocean wave SVG */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 18,
          opacity: phase === "submitting" ? 0.45 : canSubmit ? 0.2 : 0.08,
          pointerEvents: "none",
          transition: "opacity 0.5s",
        }}
        viewBox="0 0 280 18"
        preserveAspectRatio="none"
      >
        <path d="M0 12 Q35 4 70 12 Q105 20 140 12 Q175 4 210 12 Q245 20 280 12 L280 18 L0 18 Z" fill="#1a6b8a">
          {phase === "submitting" && (
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="-70 0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          )}
        </path>
        {phase === "submitting" && (
          <path d="M280 12 Q315 4 350 12 Q385 20 420 12 Q455 4 490 12 Q525 20 560 12 L560 18 L280 18 Z" fill="#1a6b8a">
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="-70 0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </path>
        )}
      </svg>

      {/* Track label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          paddingLeft: phase === "success" || phase === "submitting" ? 16 : thumbX + THUMB_W + 4,
          paddingRight: 16,
          transition: "padding-left 0.1s",
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: labelColor,
            fontWeight: 700,
            whiteSpace: "nowrap",
            transition: "color 0.3s",
          }}
        >
          {trackLabel}
        </span>
      </div>

      {/* Ship thumb */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "absolute",
          top: "50%",
          ...(phase === "success"
            ? { right: 2, left: "auto", transform: "translateY(-50%)" }
            : phase === "submitting"
            ? { left: "50%", transform: "translate(-50%, -50%)" }
            : { left: thumbX, right: "auto", transform: "translateY(-50%)" }),
          width: THUMB_W,
          height: THUMB_W,
          cursor:
            phase === "submitting" ? "wait" : disabled ? "not-allowed" : dragging ? "grabbing" : "grab",
          transition:
            phase === "submitting"
              ? "left 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.3s"
              : dragging
              ? "none"
              : "left 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.3s",
          filter: shipFilter,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
          zIndex: 2,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ship/ship.png"
          alt="Drag to join the waitlist"
          draggable={false}
          style={{
            width: 46,
            height: 46,
            objectFit: "contain",
            pointerEvents: "none",
            opacity: disabled && phase !== "submitting" && phase !== "success" ? 0.4 : 1,
            transition: "opacity 0.3s",
            transform: dragging ? "scale(1.07) translateY(-2px)" : "scale(1)",
            animation:
              phase === "submitting"
                ? "shipSail 1.4s ease-in-out infinite"
                : dragging
                ? "none"
                : "shipFloatSlider 3s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes shipFloatSlider {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes shipSail {
          0%   { transform: translateY(0px)   rotate(-6deg) scale(1.05); }
          25%  { transform: translateY(-4px)  rotate(0deg)  scale(1.08); }
          50%  { transform: translateY(0px)   rotate(6deg)  scale(1.05); }
          75%  { transform: translateY(-4px)  rotate(0deg)  scale(1.08); }
          100% { transform: translateY(0px)   rotate(-6deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
