import type { PricePoint } from "@/lib/simulation/types";

/**
 * Datasets de comparaison APPROXIMATIFS, en EUR, à but pédagogique (mise en perspective
 * du couple risque/rendement de la crypto). Ce ne sont pas des cotations officielles.
 *
 * - ETF Monde : indice actions mondiales (type MSCI World), base 100 en janv. 2017.
 * - Livret A : épargne réglementée sans risque, modélisée par ses taux successifs.
 */

const toTime = (iso: string): number => new Date(`${iso}T00:00:00Z`).getTime();

/** Construit une série mensuelle (clôture début de mois) à partir de prix successifs. */
function monthly(startYear: number, startMonth: number, prices: number[]): PricePoint[] {
  const points: PricePoint[] = [];
  let year = startYear;
  let month = startMonth;
  for (const price of prices) {
    const mm = String(month).padStart(2, "0");
    points.push({ date: `${year}-${mm}-01`, price });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return points;
}

// ETF Monde (type MSCI World), EUR, base 100 en janv. 2017. Volatilité bien moindre que la crypto :
// krach COVID (mars 2020), repli 2022, sinon tendance haussière régulière.
// prettier-ignore
const ETF_WORLD = monthly(2017, 1, [
  100, 101, 101, 102, 103, 104, 103, 104, 105, 106, 106, 107,                     // 2017 (+7%)
  108, 109, 107, 108, 109, 110, 111, 112, 110, 104, 106, 103,                     // 2018 (-4%)
  107, 110, 113, 115, 112, 117, 119, 118, 120, 122, 127, 134,                     // 2019 (+30%)
  136, 138, 108, 118, 124, 127, 132, 136, 134, 133, 140, 142,                     // 2020 (COVID puis +6%)
  145, 150, 154, 158, 160, 165, 167, 170, 172, 176, 179, 186,                     // 2021 (+31%)
  180, 178, 182, 170, 168, 158, 165, 160, 150, 158, 162, 162,                     // 2022 (-13%)
  166, 168, 170, 172, 176, 180, 184, 180, 178, 176, 186, 193,                     // 2023 (+19%)
  198, 205, 212, 210, 218, 222, 224, 220, 228, 232, 240, 243,                     // 2024 (+26%)
  248, 250, 245, 240, 252, 256, 260, 262, 266, 270, 265, 267,                     // 2025 (+10%)
  269, 271, 270, 272, 274, 275,                                                   // 2026 jan-juin
]);

export const ETF_WORLD_SERIES = ETF_WORLD;

/** Interpolation linéaire dans le temps sur une série de prix triée. */
export function interpolatePrice(series: PricePoint[], date: string): number {
  if (series.length === 0) return 0;
  const t = toTime(date);
  if (t <= toTime(series[0].date)) return series[0].price;
  if (t >= toTime(series[series.length - 1].date)) return series[series.length - 1].price;
  for (let i = 0; i < series.length - 1; i++) {
    const t0 = toTime(series[i].date);
    const t1 = toTime(series[i + 1].date);
    if (t >= t0 && t <= t1) {
      if (t1 === t0) return series[i].price;
      const ratio = (t - t0) / (t1 - t0);
      return series[i].price + (series[i + 1].price - series[i].price) * ratio;
    }
  }
  return series[series.length - 1].price;
}

/** Taux du Livret A (annualisés), avec date d'entrée en vigueur. Approximatif. */
const LIVRET_A_RATES: { from: string; rate: number }[] = [
  { from: "2000-01-01", rate: 0.0075 },
  { from: "2020-02-01", rate: 0.005 },
  { from: "2022-02-01", rate: 0.01 },
  { from: "2022-08-01", rate: 0.02 },
  { from: "2023-02-01", rate: 0.03 },
  { from: "2025-02-01", rate: 0.024 },
  { from: "2026-02-01", rate: 0.017 },
];

const YEAR_MS = 365.25 * 24 * 3600 * 1000;

/**
 * Facteur de capitalisation du Livret A entre `from` et `to` (intérêts composés,
 * taux constants par morceaux). 1 € placé à `from` vaut `facteur` € à `to`.
 */
export function livretAGrowthFactor(from: string, to: string): number {
  const start = toTime(from);
  const end = toTime(to);
  if (end <= start) return 1;

  // Bornes des sous-périodes = changements de taux compris dans [start, end].
  const breakpoints = [start, ...LIVRET_A_RATES.map((r) => toTime(r.from)), end]
    .filter((t) => t >= start && t <= end)
    .sort((a, b) => a - b);

  const rateAt = (t: number): number => {
    let rate = LIVRET_A_RATES[0].rate;
    for (const r of LIVRET_A_RATES) {
      if (toTime(r.from) <= t) rate = r.rate;
    }
    return rate;
  };

  let factor = 1;
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const a = breakpoints[i];
    const b = breakpoints[i + 1];
    if (b <= a) continue;
    const years = (b - a) / YEAR_MS;
    factor *= Math.pow(1 + rateAt(a), years);
  }
  return factor;
}
