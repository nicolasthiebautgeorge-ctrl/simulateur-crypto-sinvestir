import { describe, expect, it } from "vitest";
import { calculateBenchmarks } from "@/lib/simulation/calculateBenchmarks";
import { livretAGrowthFactor } from "@/lib/market-data/benchmarkDataset";
import type { SimulationResult } from "@/lib/simulation/types";

/** Construit un résultat minimal (seuls effectiveRange + frequency sont utilisés). */
function makeResult(
  start: string,
  end: string,
  frequency: SimulationResult["frequency"],
): SimulationResult {
  return {
    crypto: "bitcoin",
    frequency,
    currency: "EUR",
    effectiveRange: { start, end },
    purchases: 0,
    quantity: 0,
    totalInvested: 0,
    finalValue: 0,
    profit: 0,
    profitPct: 0,
    timeline: [],
    risk: {
      maxDrawdownPct: 0,
      maxDrawdownPeakDate: start,
      maxDrawdownTroughDate: start,
      timeUnderwaterPct: 0,
    },
    panic: { sellDate: start, finalValue: 0, costOfPanic: 0 },
    warnings: [],
  };
}

describe("livretAGrowthFactor", () => {
  it("capitalise (facteur > 1) sur une période positive", () => {
    const f = livretAGrowthFactor("2020-01-01", "2026-01-01");
    expect(f).toBeGreaterThan(1);
    expect(f).toBeLessThan(1.3); // ~quelques % par an, pas de l'explosion
  });

  it("renvoie 1 si la fin précède le début", () => {
    expect(livretAGrowthFactor("2026-01-01", "2020-01-01")).toBe(1);
  });
});

describe("calculateBenchmarks", () => {
  it("renvoie ETF Monde et Livret A avec le même investi", () => {
    const result = makeResult("2020-01-01", "2026-01-01", "monthly");
    const benchmarks = calculateBenchmarks(result, 100);

    expect(benchmarks.map((b) => b.id)).toEqual(["etf-world", "livret-a"]);
    // Même calendrier mensuel ⇒ même montant investi pour les deux.
    expect(benchmarks[0].totalInvested).toBe(benchmarks[1].totalInvested);
    expect(benchmarks[0].totalInvested).toBeGreaterThan(0);
  });

  it("ETF Monde haussier > Livret A sur 2020→2026", () => {
    const result = makeResult("2020-01-01", "2026-01-01", "monthly");
    const [etf, livret] = calculateBenchmarks(result, 100);
    expect(etf.finalValue).toBeGreaterThan(livret.finalValue);
    expect(livret.finalValue).toBeGreaterThan(livret.totalInvested); // sans risque mais positif
  });

  it("renvoie [] pour un montant invalide", () => {
    const result = makeResult("2020-01-01", "2026-01-01", "monthly");
    expect(calculateBenchmarks(result, 0)).toEqual([]);
  });
});
