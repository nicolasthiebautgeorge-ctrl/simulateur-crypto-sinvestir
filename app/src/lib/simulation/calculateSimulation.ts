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
    risk: {
      maxDrawdownPct: 0,
      maxDrawdownPeakDate: input.startDate,
      maxDrawdownTroughDate: input.startDate,
      timeUnderwaterPct: 0,
    },
    panic: { sellDate: input.startDate, finalValue: 0, costOfPanic: 0 },
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

  const { timeline, risk, panic } = buildTimelineAndMetrics(
    input,
    provider,
    start,
    end,
    purchases,
    totalInvested,
    finalValue,
  );

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
    risk,
    panic,
    warnings,
  };
}

function clamp(value: string, min: string, max: string): string {
  const t = parseISO(value).getTime();
  if (t < parseISO(min).getTime()) return min;
  if (t > parseISO(max).getTime()) return max;
  return value;
}

type Purchase = { date: string; cumQuantity: number; cumInvested: number };

/** État cumulé (quantité + investi) à une date donnée. */
function cumStateAt(purchases: Purchase[], t: number): { quantity: number; invested: number } {
  let quantity = 0;
  let invested = 0;
  for (const p of purchases) {
    if (parseISO(p.date).getTime() <= t) {
      quantity = p.cumQuantity;
      invested = p.cumInvested;
    } else {
      break;
    }
  }
  return { quantity, invested };
}

/**
 * Construit la série du graphique ET les indicateurs comportementaux en une passe :
 * - `value` : patrimoine de l'investisseur discipliné (conserve tout).
 * - `panicValue` : patrimoine de celui qui a vendu au pire creux puis gardé ses versements en cash.
 * - `risk` : max drawdown du cours + part du temps en moins-value.
 * - `panic` : coût chiffré de la vente au pire moment.
 */
function buildTimelineAndMetrics(
  input: SimulationInput,
  provider: MarketDataProvider,
  start: string,
  end: string,
  purchases: Purchase[],
  totalInvested: number,
  finalValue: number,
) {
  const samples = sampleDates(start, end);
  const prices = samples.map((date) => provider.getPriceAt(input.crypto, date) ?? 0);

  // 1. Max drawdown du cours (pic → creux), pour situer la « panique » et le stress-test.
  let peak = prices[0] ?? 0;
  let peakDate = samples[0] ?? start;
  let runningPeakDate = peakDate;
  let maxDrawdownPct = 0;
  let troughDate = samples[0] ?? start;
  let troughPrice = prices[0] ?? 0;
  for (let i = 0; i < samples.length; i++) {
    const price = prices[i];
    if (price > peak) {
      peak = price;
      runningPeakDate = samples[i];
    }
    const dd = peak > 0 ? price / peak - 1 : 0;
    if (dd < maxDrawdownPct) {
      maxDrawdownPct = dd;
      troughDate = samples[i];
      troughPrice = price;
      peakDate = runningPeakDate;
    }
  }

  // 2. Trajectoire « panique » : vente totale au creux, versements suivants gardés en cash.
  const troughT = parseISO(troughDate).getTime();
  const atTrough = cumStateAt(purchases, troughT);
  const cashFromSale = atTrough.quantity * troughPrice;

  // 3. Série + temps en moins-value.
  let underwaterCount = 0;
  let investedPoints = 0;
  const timeline: TimelinePoint[] = samples.map((date, i) => {
    const t = parseISO(date).getTime();
    const { quantity, invested } = cumStateAt(purchases, t);
    const value = quantity * prices[i];
    const panicValue =
      t <= troughT ? value : cashFromSale + (invested - atTrough.invested);
    if (invested > 0) {
      investedPoints++;
      if (value < invested) underwaterCount++;
    }
    return { date, invested, value, panicValue };
  });

  const panicFinalValue = cashFromSale + (totalInvested - atTrough.invested);

  return {
    timeline,
    risk: {
      maxDrawdownPct: maxDrawdownPct * 100,
      maxDrawdownPeakDate: peakDate,
      maxDrawdownTroughDate: troughDate,
      timeUnderwaterPct: investedPoints > 0 ? (underwaterCount / investedPoints) * 100 : 0,
    },
    panic: {
      sellDate: troughDate,
      finalValue: panicFinalValue,
      costOfPanic: finalValue - panicFinalValue,
    },
  };
}
