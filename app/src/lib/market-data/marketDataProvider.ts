import type { CryptoId, DateRange, PricePoint } from "@/lib/simulation/types";
import { DATASET_CURRENCY, PRICE_SERIES } from "@/lib/market-data/cryptoDataset";

/**
 * Abstraction de la source de prix. Le moteur de calcul ne dépend que de cette interface :
 * on peut substituer une implémentation CoinGecko sans modifier la logique métier.
 */
export interface MarketDataProvider {
  readonly currency: string;
  getAvailableRange(crypto: CryptoId): DateRange | null;
  /** Prix à une date donnée (interpolé), ou null si l'actif est inconnu. */
  getPriceAt(crypto: CryptoId, date: string): number | null;
  /** Points bruts disponibles dans l'intervalle [from, to] (bornes incluses). */
  getSeries(crypto: CryptoId, from: string, to: string): PricePoint[];
}

const toTime = (iso: string): number => new Date(`${iso}T00:00:00Z`).getTime();

/** Source par défaut : dataset local versionné. */
export class LocalDatasetProvider implements MarketDataProvider {
  readonly currency = DATASET_CURRENCY;

  private series(crypto: CryptoId): PricePoint[] | null {
    return PRICE_SERIES[crypto] ?? null;
  }

  getAvailableRange(crypto: CryptoId): DateRange | null {
    const s = this.series(crypto);
    if (!s || s.length === 0) return null;
    return { start: s[0].date, end: s[s.length - 1].date };
  }

  getPriceAt(crypto: CryptoId, date: string): number | null {
    const s = this.series(crypto);
    if (!s || s.length === 0) return null;

    const t = toTime(date);
    if (t <= toTime(s[0].date)) return s[0].price;
    if (t >= toTime(s[s.length - 1].date)) return s[s.length - 1].price;

    // Encadrement + interpolation linéaire dans le temps.
    for (let i = 0; i < s.length - 1; i++) {
      const t0 = toTime(s[i].date);
      const t1 = toTime(s[i + 1].date);
      if (t >= t0 && t <= t1) {
        if (t1 === t0) return s[i].price;
        const ratio = (t - t0) / (t1 - t0);
        return s[i].price + (s[i + 1].price - s[i].price) * ratio;
      }
    }
    return s[s.length - 1].price;
  }

  getSeries(crypto: CryptoId, from: string, to: string): PricePoint[] {
    const s = this.series(crypto);
    if (!s) return [];
    const fromT = toTime(from);
    const toT = toTime(to);
    return s.filter((p) => {
      const t = toTime(p.date);
      return t >= fromT && t <= toT;
    });
  }
}

/** Instance partagée (source de données par défaut). */
export const localProvider = new LocalDatasetProvider();
