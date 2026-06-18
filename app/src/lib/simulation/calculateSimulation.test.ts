import { describe, expect, it } from "vitest";
import { calculateSimulation } from "@/lib/simulation/calculateSimulation";
import type { MarketDataProvider } from "@/lib/market-data/marketDataProvider";
import type { CryptoId, DateRange, PricePoint } from "@/lib/simulation/types";

/**
 * Provider de test déterministe : prix linéaire simple (10 → 20 sur l'année 2020),
 * indépendant du vrai dataset. On teste la LOGIQUE, pas les données.
 */
function makeProvider(points: PricePoint[]): MarketDataProvider {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const t = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
  return {
    currency: "EUR",
    getAvailableRange(): DateRange | null {
      return sorted.length
        ? { start: sorted[0].date, end: sorted[sorted.length - 1].date }
        : null;
    },
    getPriceAt(_crypto: CryptoId, date: string): number | null {
      if (!sorted.length) return null;
      const time = t(date);
      if (time <= t(sorted[0].date)) return sorted[0].price;
      if (time >= t(sorted[sorted.length - 1].date))
        return sorted[sorted.length - 1].price;
      for (let i = 0; i < sorted.length - 1; i++) {
        const t0 = t(sorted[i].date);
        const t1 = t(sorted[i + 1].date);
        if (time >= t0 && time <= t1) {
          const r = (time - t0) / (t1 - t0);
          return sorted[i].price + (sorted[i + 1].price - sorted[i].price) * r;
        }
      }
      return sorted[sorted.length - 1].price;
    },
    getSeries(_crypto, from, to) {
      return sorted.filter((p) => t(p.date) >= t(from) && t(p.date) <= t(to));
    },
  };
}

const flat = makeProvider([
  { date: "2020-01-01", price: 100 },
  { date: "2020-12-01", price: 200 },
]);

describe("calculateSimulation — one-shot", () => {
  it("double la mise quand le prix double", () => {
    const r = calculateSimulation(
      {
        crypto: "bitcoin",
        amount: 1000,
        frequency: "one-shot",
        startDate: "2020-01-01",
        endDate: "2020-12-01",
      },
      flat,
    );
    expect(r.purchases).toBe(1);
    expect(r.totalInvested).toBe(1000);
    expect(r.quantity).toBeCloseTo(10, 6); // 1000 / 100
    expect(r.finalValue).toBeCloseTo(2000, 6); // 10 * 200
    expect(r.profit).toBeCloseTo(1000, 6);
    expect(r.profitPct).toBeCloseTo(100, 6);
  });
});

describe("calculateSimulation — DCA mensuel", () => {
  it("investit à chaque mois et cumule les quantités", () => {
    const r = calculateSimulation(
      {
        crypto: "bitcoin",
        amount: 100,
        frequency: "monthly",
        startDate: "2020-01-01",
        endDate: "2020-12-01",
      },
      flat,
    );
    expect(r.purchases).toBe(12); // janv → déc inclus
    expect(r.totalInvested).toBe(1200);
    expect(r.finalValue).toBeGreaterThan(r.totalInvested); // marché haussier
    // Acheter tôt (prix bas) rend la valeur finale > simple x2 du dernier versement.
    expect(r.quantity).toBeGreaterThan(0);
  });
});

describe("calculateSimulation — robustesse", () => {
  it("ajuste les dates hors plage et signale un avertissement", () => {
    const r = calculateSimulation(
      {
        crypto: "bitcoin",
        amount: 500,
        frequency: "one-shot",
        startDate: "2010-01-01",
        endDate: "2030-01-01",
      },
      flat,
    );
    expect(r.effectiveRange).toEqual({ start: "2020-01-01", end: "2020-12-01" });
    expect(r.warnings.some((w) => w.code === "DATES_CLAMPED")).toBe(true);
  });

  it("rejette un montant nul ou négatif", () => {
    const r = calculateSimulation(
      {
        crypto: "bitcoin",
        amount: 0,
        frequency: "one-shot",
        startDate: "2020-01-01",
        endDate: "2020-12-01",
      },
      flat,
    );
    expect(r.totalInvested).toBe(0);
    expect(r.warnings.some((w) => w.code === "INVALID_AMOUNT")).toBe(true);
  });

  it("rejette une période inversée (début après fin)", () => {
    const r = calculateSimulation(
      {
        crypto: "bitcoin",
        amount: 500,
        frequency: "one-shot",
        startDate: "2020-12-01",
        endDate: "2020-01-01",
      },
      flat,
    );
    expect(r.warnings.some((w) => w.code === "START_AFTER_END")).toBe(true);
  });

  it("produit une timeline non vide pour le graphique", () => {
    const r = calculateSimulation(
      {
        crypto: "bitcoin",
        amount: 100,
        frequency: "monthly",
        startDate: "2020-01-01",
        endDate: "2020-12-01",
      },
      flat,
    );
    expect(r.timeline.length).toBeGreaterThan(1);
    expect(r.timeline[0].invested).toBeLessThanOrEqual(
      r.timeline[r.timeline.length - 1].invested,
    );
  });
});
