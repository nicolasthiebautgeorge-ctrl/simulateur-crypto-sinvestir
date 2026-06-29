"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
  /** Durée du count-up en secondes. */
  duration?: number;
}

/**
 * Compteur animé (count-up) sur les grandes valeurs. Anime depuis la valeur précédente
 * vers la nouvelle à chaque changement. Respecte `prefers-reduced-motion`.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 0.9,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const prev = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduce, duration]);

  return <span className={className}>{format(display)}</span>;
}
