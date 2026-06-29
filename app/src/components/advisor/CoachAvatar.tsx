"use client";

import { motion, useReducedMotion } from "motion/react";

export type CoachState = "idle" | "thinking" | "speaking";

interface CoachAvatarProps {
  state: CoachState;
  size?: number;
}

/**
 * Orbe dorée « vivante » qui réagit à l'état du coach.
 * On-brand (or/navy), sobre — pas un avatar gadget. Respecte prefers-reduced-motion.
 */
export function CoachAvatar({ state, size = 44 }: CoachAvatarProps) {
  const reduce = useReducedMotion();

  const coreScale =
    reduce || state === "idle"
      ? [1, 1.04, 1]
      : state === "speaking"
        ? [1, 1.16, 0.97, 1.12, 1]
        : [1, 1.08, 1];

  const coreDuration =
    state === "speaking" ? 0.7 : state === "thinking" ? 1.1 : 2.6;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Halo / glow */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(228,192,49,0.55) 0%, rgba(228,192,49,0) 70%)",
        }}
        animate={reduce ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.18, 1] }}
        transition={{ duration: coreDuration, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Anneau de réflexion */}
      {state === "thinking" && !reduce ? (
        <motion.span
          className="absolute rounded-full border-2 border-gold/70 border-t-transparent"
          style={{ width: size * 0.92, height: size * 0.92 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      ) : null}

      {/* Cœur de l'orbe */}
      <motion.span
        className="relative rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background:
            "radial-gradient(circle at 35% 30%, #f6e3a1 0%, #e4c031 45%, #b8860b 100%)",
          boxShadow:
            "0 0 18px -2px rgba(228,192,49,0.8), inset 0 1px 2px rgba(255,255,255,0.6)",
        }}
        animate={{ scale: coreScale }}
        transition={{ duration: coreDuration, repeat: Infinity, ease: "easeInOut" }}
      />
    </span>
  );
}
