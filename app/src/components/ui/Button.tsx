import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
}

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-light tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-deep",
  ghost: "border border-white/15 text-text hover:bg-white/5",
} as const;

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
