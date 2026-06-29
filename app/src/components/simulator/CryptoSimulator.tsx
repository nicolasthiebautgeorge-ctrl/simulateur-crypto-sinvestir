"use client";

import { useMemo, useState } from "react";
import type { SimulationInput } from "@/lib/simulation/types";
import { calculateSimulation } from "@/lib/simulation/calculateSimulation";
import { calculateBenchmarks } from "@/lib/simulation/calculateBenchmarks";
import { localProvider } from "@/lib/market-data/marketDataProvider";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SimulatorForm } from "@/components/simulator/SimulatorForm";
import { ScenarioAssistant } from "@/components/simulator/ScenarioAssistant";
import { ResultsCards } from "@/components/simulator/ResultsCards";
import { BehaviorInsight } from "@/components/simulator/BehaviorInsight";
import { BenchmarkComparison } from "@/components/simulator/BenchmarkComparison";
import { PerformanceChart } from "@/components/simulator/PerformanceChart";
import { RiskDisclaimer } from "@/components/simulator/RiskDisclaimer";

const DEFAULT_INPUT: SimulationInput = {
  crypto: "bitcoin",
  amount: 50,
  frequency: "monthly",
  startDate: "2024-07-01",
  endDate: "2026-06-01",
};

interface CryptoSimulatorProps {
  /** Valeurs initiales (pour intégration / embed). */
  initialInput?: Partial<SimulationInput>;
}

/**
 * Composant autonome et réutilisable : formulaire + résultats + graphique + disclaimer.
 * Calculs 100 % client-side (fonction pure), source de prix via `MarketDataProvider`.
 */
export function CryptoSimulator({ initialInput }: CryptoSimulatorProps) {
  const [input, setInput] = useState<SimulationInput>({
    ...DEFAULT_INPUT,
    ...initialInput,
  });

  const onChange = (patch: Partial<SimulationInput>) =>
    setInput((prev) => ({ ...prev, ...patch }));

  const range = useMemo(
    () => localProvider.getAvailableRange(input.crypto),
    [input.crypto],
  );

  const result = useMemo(
    () => calculateSimulation(input, localProvider),
    [input],
  );

  const benchmarks = useMemo(
    () => calculateBenchmarks(result, input.amount),
    [result, input.amount],
  );

  const hasResult = result.totalInvested > 0;

  return (
    <div className="flex flex-col gap-5">
      <ScenarioAssistant onApply={onChange} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
        <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Paramètres</h2>
        <p className="mt-1 text-sm text-text-muted">
          Configurez votre scénario d&apos;investissement.
        </p>
        <div className="mt-5">
          <SimulatorForm
            value={input}
            onChange={onChange}
            currency={localProvider.currency}
            range={range}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-5">
        {result.warnings
          .filter((w) => w.code !== "DATES_CLAMPED")
          .map((w) => (
            <div
              key={w.code}
              className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
            >
              {w.message}
            </div>
          ))}

        {hasResult ? (
          <>
            <Reveal>
              <ResultsCards result={result} />
            </Reveal>
            <Reveal delay={0.06}>
              <Card className="p-6 shadow-[0_0_60px_-20px_var(--color-brand)]">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-display text-lg font-semibold">Évolution</h2>
                  <span className="text-xs text-text-muted">
                    {result.effectiveRange.start} → {result.effectiveRange.end}
                  </span>
                </div>
                <PerformanceChart
                  data={result.timeline}
                  currency={result.currency}
                />
              </Card>
            </Reveal>
            <Reveal delay={0.12}>
              <BehaviorInsight result={result} />
            </Reveal>
            <Reveal delay={0.18}>
              <BenchmarkComparison result={result} benchmarks={benchmarks} />
            </Reveal>
          </>
        ) : (
          <Card className="flex min-h-[200px] items-center justify-center p-6">
            <p className="text-center text-sm text-text-muted">
              Renseignez un montant et une période valides pour lancer la
              simulation.
            </p>
          </Card>
        )}

        <RiskDisclaimer />
      </div>
      </div>
    </div>
  );
}
