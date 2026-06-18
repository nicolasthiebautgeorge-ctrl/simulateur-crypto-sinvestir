import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

/** Libellé + contrôle, mise en page cohérente pour le formulaire. */
export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-text-subtle"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-white/10 bg-surface-soft/60 px-3.5 py-2.5 text-text placeholder:text-text-muted transition-colors focus:border-focus";

/** Champ texte/nombre stylé. */
export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

/** Sélecteur stylé. */
export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={`${inputBase} appearance-none ${props.className ?? ""}`}
    />
  );
}
