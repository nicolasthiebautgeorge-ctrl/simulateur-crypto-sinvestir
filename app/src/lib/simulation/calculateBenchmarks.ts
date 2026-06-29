import type { BenchmarkResult, SimulationResult } from "@/lib/simulation/types";
import { buildSchedule } from "@/lib/simulation/dateUtils";
import {
  ETF_WORLD_SERIES,
  interpolatePrice,
  livretAGrowthFactor,
} from "@/lib/market-data/benchmarkDataset";

/**
 * Calcule, sur le MÊME scénario que la crypto (mêmes versements, mêmes dates, même période),
 * ce qu'auraient donné un ETF Monde et un Livret A. Fonction pure — mise en perspective
 * pédagogique du couple risque/rendement.
 *
 * @param amount montant par versement (identique à la simulation crypto)
 */
export function calculateBenchmarks(
  result: SimulationResult,
  amount: number,
): BenchmarkResult[] {
  const { start, end } = result.effectiveRange;
  const schedule = buildSchedule(start, end, result.frequency);
  if (schedule.length === 0 || !(amount > 0)) return [];

  const totalInvested = schedule.length * amount;

  // ETF Monde : 1 € investi à la date d vaut prix_fin / prix_d à la fin.
  const etfEnd = interpolatePrice(ETF_WORLD_SERIES, end);
  let etfFinal = 0;
  for (const date of schedule) {
    const priceAt = interpolatePrice(ETF_WORLD_SERIES, date);
    if (priceAt > 0) etfFinal += amount * (etfEnd / priceAt);
  }

  // Livret A : capitalisation au taux réglementaire entre chaque versement et la fin.
  let livretFinal = 0;
  for (const date of schedule) {
    livretFinal += amount * livretAGrowthFactor(date, end);
  }

  const toResult = (
    id: string,
    label: string,
    finalValue: number,
  ): BenchmarkResult => {
    const profit = finalValue - totalInvested;
    return {
      id,
      label,
      totalInvested,
      finalValue,
      profit,
      profitPct: totalInvested > 0 ? (profit / totalInvested) * 100 : 0,
    };
  };

  return [
    toResult("etf-world", "ETF Monde", etfFinal),
    toResult("livret-a", "Livret A", livretFinal),
  ];
}
