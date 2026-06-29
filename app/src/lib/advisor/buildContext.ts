import type {
  BenchmarkResult,
  Frequency,
  SimulationResult,
} from "@/lib/simulation/types";
import type { AdvisorContext } from "@/lib/advisor/types";
import { CRYPTOS } from "@/lib/market-data/cryptoDataset";
import { formatDateLabel } from "@/lib/formatters";

const FREQUENCY_LABELS: Record<Frequency, string> = {
  "one-shot": "achat unique",
  daily: "DCA quotidien",
  weekly: "DCA hebdomadaire",
  monthly: "DCA mensuel",
};

/** Transforme un résultat de simulation en contexte compact pour le coach. */
export function buildAdvisorContext(
  result: SimulationResult,
  benchmarks: BenchmarkResult[],
): AdvisorContext {
  return {
    cryptoLabel: CRYPTOS[result.crypto]?.name ?? result.crypto,
    frequencyLabel: FREQUENCY_LABELS[result.frequency],
    periodLabel: `${formatDateLabel(result.effectiveRange.start)} → ${formatDateLabel(
      result.effectiveRange.end,
    )}`,
    currency: result.currency,
    totalInvested: result.totalInvested,
    finalValue: result.finalValue,
    profit: result.profit,
    profitPct: result.profitPct,
    maxDrawdownPct: result.risk.maxDrawdownPct,
    timeUnderwaterPct: result.risk.timeUnderwaterPct,
    panicCost: result.panic.costOfPanic,
    panicSellDateLabel: formatDateLabel(result.panic.sellDate),
    benchmarks: benchmarks.map((b) => ({
      label: b.label,
      finalValue: b.finalValue,
      profitPct: b.profitPct,
    })),
  };
}
