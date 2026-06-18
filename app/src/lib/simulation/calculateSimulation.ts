import type {
  SimulationInput,
  SimulationResult,
  SimulationWarning,
  TimelinePoint,
} from "@/lib/simulation/types";
import type { MarketDataProvider } from "@/lib/market-data/marketDataProvider";
import { localProvider } from "@/lib/market-data/marketDataProvider";
import { buildSchedule, parseISO, sampleDates } from "@/lib/simulation/dateUtils";

/**
 * Moteur de backtest — fonction pure (aucun effet de bord, aucune dépendance React).
 *
 * - one-shot : montant investi à la date de début.
 * - DCA : `montant` investi à chaque échéance de la fréquence.
 *
 * La quantité accumulée est valorisée au prix de la date de fin.
 */
export function calculateSimulation(
  input: SimulationInput,
  provider: MarketDataProvider = localProvider,
): SimulationResult {
  const warnings: SimulationWarning[] = [];
  const range = provider.getAvailableRange(input.crypto);

  const empty = (extraWarning?: SimulationWarning): SimulationResult => ({
    crypto: input.crypto,
    frequency: input.frequency,
    currency: provider.currency,
    effectiveRange: { start: input.startDate, end: input.endDate },
    purchases: 0,
    quantity: 0,
    totalInvested: 0,
    finalValue: 0,
    profit: 0,
    profitPct: 0,
    timeline: [],
    warnings: extraWarning ? [...warnings, extraWarning] : warnings,
  });

  if (!range) {
    return empty({
      code: "NO_DATA",
      message: "Aucune donnée disponible pour cet actif.",
    });
  }

  if (!(input.amount > 0)) {
    return empty({
      code: "INVALID_AMOUNT",
      message: "Le montant doit être strictement positif.",
    });
  }

  // Ajustement des dates à la plage de données disponible.
  let start = input.startDate;
  let end = input.endDate;
  if (parseISO(start).getTime() > parseISO(end).getTime()) {
    return empty({
      code: "START_AFTER_END",
      message: "La date de début est postérieure à la date de fin.",
    });
  }

  const clampedStart = clamp(start, range.start, range.end);
  const clampedEnd = clamp(end, range.start, range.end);
  if (clampedStart !== start || clampedEnd !== end) {
    warnings.push({
      code: "DATES_CLAMPED",
      message: `Période ajustée aux données disponibles (${range.start} → ${range.end}).`,
    });
  }
  start = clampedStart;
  end = clampedEnd;

  // Calendrier des achats.
  const schedule = buildSchedule(start, end, input.frequency);

  // Accumulation des quantités, achat par achat.
  let quantity = 0;
  let totalInvested = 0;
  const purchases: { date: string; cumQuantity: number; cumInvested: number }[] = [];
  for (const date of schedule) {
    const price = provider.getPriceAt(input.crypto, date);
    if (price == null || price <= 0) continue;
    quantity += input.amount / price;
    totalInvested += input.amount;
    purchases.push({ date, cumQuantity: quantity, cumInvested: totalInvested });
  }

  const finalPrice = provider.getPriceAt(input.crypto, end) ?? 0;
  const finalValue = quantity * finalPrice;
  const profit = finalValue - totalInvested;
  const profitPct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

  const timeline = buildTimeline(input, provider, start, end, purchases);

  return {
    crypto: input.crypto,
    frequency: input.frequency,
    currency: provider.currency,
    effectiveRange: { start, end },
    purchases: purchases.length,
    quantity,
    totalInvested,
    finalValue,
    profit,
    profitPct,
    timeline,
    warnings,
  };
}

function clamp(value: string, min: string, max: string): string {
  const t = parseISO(value).getTime();
  if (t < parseISO(min).getTime()) return min;
  if (t > parseISO(max).getTime()) return max;
  return value;
}

/** Série échantillonnée investi vs valeur, pour le graphique. */
function buildTimeline(
  input: SimulationInput,
  provider: MarketDataProvider,
  start: string,
  end: string,
  purchases: { date: string; cumQuantity: number; cumInvested: number }[],
): TimelinePoint[] {
  const samples = sampleDates(start, end);
  return samples.map((date) => {
    const t = parseISO(date).getTime();
    // État cumulé (quantité + investi) à cette date.
    let cumQuantity = 0;
    let cumInvested = 0;
    for (const p of purchases) {
      if (parseISO(p.date).getTime() <= t) {
        cumQuantity = p.cumQuantity;
        cumInvested = p.cumInvested;
      } else {
        break;
      }
    }
    const price = provider.getPriceAt(input.crypto, date) ?? 0;
    return {
      date,
      invested: cumInvested,
      value: cumQuantity * price,
    };
  });
}
