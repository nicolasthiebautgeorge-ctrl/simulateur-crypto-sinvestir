"use client";

import { useState } from "react";
import type { SimulationInput } from "@/lib/simulation/types";
import { parseScenario } from "@/lib/assistant/parseScenario";

interface ScenarioAssistantProps {
  onApply: (patch: Partial<SimulationInput>) => void;
}

const EXAMPLES = [
  "100 € par mois sur Bitcoin depuis 2020",
  "1000 € d'un coup sur Ethereum en 2021",
  "50 € par semaine sur Solana depuis janvier 2022",
];

/**
 * Assistant en langage naturel : « décris ton scénario » → pré-remplit le formulaire.
 * Parsing 100 % local (déterministe, démo incassable), via une interface `ScenarioParser`
 * branchable à un LLM plus tard — pensée « agent ».
 */
export function ScenarioAssistant({ onApply }: ScenarioAssistantProps) {
  const [text, setText] = useState("");
  const [understood, setUnderstood] = useState<string[] | null>(null);

  const run = (value: string) => {
    const { patch, understood } = parseScenario(value);
    if (understood.length > 0) onApply(patch);
    setUnderstood(understood);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) run(text);
  };

  return (
    <div className="rounded-2xl border border-brand/30 bg-brand/[0.06] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-base">✨</span>
        <h2 className="font-display text-sm font-semibold">
          Décrivez votre scénario en une phrase
        </h2>
      </div>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex. 100 € par mois sur Bitcoin depuis 2020"
          aria-label="Décrivez votre scénario en langage naturel"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-surface-soft/60 px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Pré-remplir
        </button>
      </form>

      {understood === null ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Exemples :</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setText(ex);
                run(ex);
              }}
              className="rounded-full border border-white/10 bg-surface-soft/50 px-3 py-1 text-xs text-text-muted transition-colors hover:border-brand/40 hover:text-text"
            >
              {ex}
            </button>
          ))}
        </div>
      ) : understood.length > 0 ? (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
          <span>Compris :</span>
          {understood.map((u) => (
            <span
              key={u}
              className="rounded-full bg-brand/15 px-2.5 py-1 font-medium text-brand-light"
            >
              {u}
            </span>
          ))}
        </p>
      ) : (
        <p className="mt-3 text-xs text-text-muted">
          Je n&apos;ai rien reconnu. Essayez par ex.{" "}
          <span className="text-text-subtle">
            « 100 € par mois sur Bitcoin depuis 2020 »
          </span>
          .
        </p>
      )}
    </div>
  );
}
