import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Carte sombre fidèle au design S'investir (radius 20px, bordure subtile, ombre profonde). */
export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-[20px] border border-white/10 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_32px_80px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}
