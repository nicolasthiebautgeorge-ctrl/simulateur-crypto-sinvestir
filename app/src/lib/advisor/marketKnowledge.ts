import type { CryptoId } from "@/lib/simulation/types";
import { CRYPTOS, PRICE_SERIES } from "@/lib/market-data/cryptoDataset";
import { formatDateLabel } from "@/lib/formatters";

/**
 * Calcule des repères de fluctuation RÉELS à partir du dataset local
 * (données mensuelles approximatives). Objectif : ancrer le coach dans des
 * chiffres vérifiables plutôt que des généralités hallucinées.
 */

function pct(x: number): string {
  return `${x >= 0 ? "+" : ""}${Math.round(x * 100)} %`;
}

/** Volatilité annualisée à partir des rendements mensuels (écart-type × √12). */
function annualizedVolatility(prices: number[]): number {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i += 1) {
    if (prices[i - 1] > 0) returns.push(prices[i] / prices[i - 1] - 1);
  }
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(12);
}

/** Pire repli pic→creux sur tout l'historique (max drawdown), avec dates. */
function maxDrawdown(series: { date: string; price: number }[]): {
  pct: number;
  peakDate: string;
  troughDate: string;
} {
  let peak = series[0]?.price ?? 0;
  let peakDate = series[0]?.date ?? "";
  let worst = 0;
  let worstPeakDate = peakDate;
  let worstTroughDate = peakDate;
  let curPeakDate = peakDate;
  for (const pt of series) {
    if (pt.price > peak) {
      peak = pt.price;
      curPeakDate = pt.date;
    }
    const dd = peak > 0 ? pt.price / peak - 1 : 0;
    if (dd < worst) {
      worst = dd;
      worstPeakDate = curPeakDate;
      worstTroughDate = pt.date;
    }
  }
  return { pct: worst, peakDate: worstPeakDate, troughDate: worstTroughDate };
}

/** Meilleure et pire performance sur 12 mois glissants. */
function rolling12(prices: number[]): { best: number; worst: number } {
  let best = -Infinity;
  let worst = Infinity;
  for (let i = 12; i < prices.length; i += 1) {
    if (prices[i - 12] > 0) {
      const r = prices[i] / prices[i - 12] - 1;
      if (r > best) best = r;
      if (r < worst) worst = r;
    }
  }
  if (!isFinite(best)) return { best: 0, worst: 0 };
  return { best, worst };
}

/** Nombre d'épisodes de correction de plus de 30 % depuis un sommet. */
function corrections30(prices: number[]): number {
  let peak = prices[0] ?? 0;
  let inEpisode = false;
  let count = 0;
  for (const p of prices) {
    if (p > peak) {
      peak = p;
      inEpisode = false;
    }
    const dd = peak > 0 ? p / peak - 1 : 0;
    if (dd <= -0.3 && !inEpisode) {
      count += 1;
      inEpisode = true;
    }
  }
  return count;
}

/** Brief textuel compact (1 ligne dense) pour la crypto demandée. */
export function buildMarketBrief(crypto: CryptoId): string {
  const series = PRICE_SERIES[crypto];
  if (!series || series.length < 13) return "";
  const meta = CRYPTOS[crypto];
  const prices = series.map((p) => p.price);

  const vol = annualizedVolatility(prices);
  const dd = maxDrawdown(series);
  const { best, worst } = rolling12(prices);
  const current = prices[prices.length - 1];
  const ath = Math.max(...prices);
  const belowAth = current / ath - 1;
  const nbCorr = corrections30(prices);

  return [
    `${meta.name} (${meta.symbol}) — repères historiques réels`,
    `(données mensuelles approx. ${formatDateLabel(series[0].date)} → ${formatDateLabel(
      series[series.length - 1].date,
    )}) :`,
    `volatilité annualisée ≈ ${Math.round(vol * 100)} % ;`,
    `pire krach historique ≈ ${pct(dd.pct)} (de ${formatDateLabel(
      dd.peakDate,
    )} à ${formatDateLabel(dd.troughDate)}) ;`,
    `actuellement ${belowAth < -0.01 ? `${pct(belowAth)} sous` : "proche de"} son plus-haut ;`,
    `meilleure année glissante ${pct(best)}, pire ${pct(worst)} ;`,
    `${nbCorr} correction(s) de plus de 30 %.`,
  ].join(" ");
}
