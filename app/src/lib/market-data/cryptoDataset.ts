import type { CryptoId, CryptoMeta, PricePoint } from "@/lib/simulation/types";

/**
 * Dataset local — prix mensuels historiques APPROXIMATIFS (clôture de fin de mois), en EUR.
 *
 * But pédagogique : reproduire la *forme* réelle des cycles (bull/bear) pour une démo stable,
 * déterministe et sans dépendance réseau. Ce ne sont pas des cotations officielles.
 * La couche `MarketDataProvider` permet de brancher une source réelle (CoinGecko) sans
 * toucher au moteur de calcul.
 */

export const DATASET_CURRENCY = "EUR";

export const CRYPTOS: Record<CryptoId, CryptoMeta> = {
  bitcoin: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  ethereum: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  solana: { id: "solana", symbol: "SOL", name: "Solana" },
};

/** Construit une série mensuelle à partir d'une année de départ et d'une liste de prix. */
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

// prettier-ignore
const BITCOIN = monthly(2017, 1, [
  900, 1100, 1050, 1200, 2000, 2300, 2500, 4000, 3800, 5500, 9000, 12500,        // 2017
  9000, 8500, 6000, 7500, 6300, 5500, 6500, 5800, 5700, 5500, 3500, 3300,        // 2018
  3300, 3400, 3600, 4600, 7000, 9500, 8500, 8500, 7300, 8200, 6500, 6400,        // 2019
  8200, 7800, 5500, 7800, 8500, 8200, 9800, 10000, 9200, 11500, 16500, 24000,    // 2020
  28000, 38000, 49000, 47000, 31000, 30000, 35000, 41000, 38000, 52000, 50000, 41000, // 2021
  33000, 38000, 41000, 36000, 28000, 18000, 22000, 19000, 18000, 19500, 15500, 15500, // 2022
  21000, 21500, 26000, 26500, 25000, 28000, 27000, 24000, 24500, 31000, 35000, 39000, // 2023
  39000, 56000, 65000, 60000, 63000, 57000, 62000, 56000, 58000, 65000, 87000, 88000, // 2024
  95000, 88000, 80000, 88000, 95000, 98000, 105000, 100000, 102000, 108000, 95000, 92000, // 2025
  98000, 100000, 95000, 102000, 108000, 110000,                                  // 2026 (jan-juin)
]);

// prettier-ignore
const ETHEREUM = monthly(2017, 1, [
  9, 12, 45, 70, 200, 280, 200, 320, 280, 290, 380, 600,                          // 2017
  950, 700, 380, 550, 480, 380, 350, 240, 190, 175, 100, 110,                     // 2018
  95, 120, 120, 135, 230, 270, 190, 160, 160, 165, 135, 115,                      // 2019
  160, 200, 120, 180, 200, 205, 290, 350, 300, 320, 500, 600,                     // 2020
  1100, 1300, 1500, 2200, 2200, 1800, 2000, 2700, 2600, 3700, 4000, 3300,         // 2021
  2300, 2600, 3000, 2700, 1800, 1000, 1600, 1500, 1300, 1450, 1200, 1100,         // 2022
  1500, 1550, 1700, 1800, 1750, 1750, 1800, 1600, 1550, 1700, 1900, 2100,         // 2023
  2150, 3100, 3300, 2900, 3500, 3200, 3100, 2400, 2350, 2400, 3100, 3300,         // 2024
  3100, 2600, 1900, 1700, 2400, 2300, 3000, 3800, 4000, 3500, 3000, 2800,         // 2025
  3200, 3400, 3100, 3300, 3600, 3700,                                             // 2026 (jan-juin)
]);

// prettier-ignore
const SOLANA = monthly(2020, 8, [
  3, 3, 2, 1.5, 1.5,                                                              // 2020 (août-déc)
  5, 12, 16, 35, 30, 28, 25, 65, 130, 170, 200, 150,                             // 2021
  95, 90, 110, 95, 45, 33, 37, 33, 32, 30, 13, 10,                               // 2022
  22, 22, 19, 20, 19, 16, 23, 20, 18, 28, 55, 95,                                // 2023
  90, 110, 175, 130, 155, 130, 175, 130, 145, 155, 220, 190,                     // 2024
  240, 180, 120, 130, 155, 145, 170, 185, 200, 180, 150, 140,                    // 2025
  160, 170, 155, 165, 180, 185,                                                  // 2026 (jan-juin)
]);

export const PRICE_SERIES: Record<CryptoId, PricePoint[]> = {
  bitcoin: BITCOIN,
  ethereum: ETHEREUM,
  solana: SOLANA,
};
