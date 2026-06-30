import type { CryptoId } from "@/lib/simulation/types";

/**
 * Snapshot marché TEMPS RÉEL via l'API publique gratuite CoinGecko.
 * Appelé côté serveur (routes API) avec un cache mémoire de 60 s pour rester
 * sous les limites de l'API gratuite. Sur erreur/timeout → renvoie le cache
 * précédent ou null (le coach reste fonctionnel avec l'historique seul).
 */

interface LiveCoin {
  id: string;
  name: string;
  price: number;
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
  athChangePct: number | null;
  marketCap: number | null;
}

const TTL_MS = 60_000;
const ENDPOINT =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,solana&price_change_percentage=24h,7d,30d";

let cache: { at: number; data: Map<string, LiveCoin> } | null = null;

async function refresh(): Promise<Map<string, LiveCoin> | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(ENDPOINT, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return cache?.data ?? null;

    const arr = (await res.json()) as Array<{
      id: string;
      name: string;
      current_price: number;
      price_change_percentage_24h_in_currency?: number;
      price_change_percentage_7d_in_currency?: number;
      price_change_percentage_30d_in_currency?: number;
      ath_change_percentage?: number;
      market_cap?: number;
    }>;

    const map = new Map<string, LiveCoin>();
    for (const c of arr) {
      map.set(c.id, {
        id: c.id,
        name: c.name,
        price: c.current_price,
        change24h: c.price_change_percentage_24h_in_currency ?? null,
        change7d: c.price_change_percentage_7d_in_currency ?? null,
        change30d: c.price_change_percentage_30d_in_currency ?? null,
        athChangePct: c.ath_change_percentage ?? null,
        marketCap: c.market_cap ?? null,
      });
    }
    cache = { at: Date.now(), data: map };
    return map;
  } catch {
    return cache?.data ?? null;
  }
}

const eur0 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

function signedPct(x: number | null): string {
  if (x == null) return "n/d";
  return `${x >= 0 ? "+" : ""}${x.toFixed(1)} %`;
}

/** Brief texte temps réel pour la crypto demandée (ou null si indisponible). */
export async function getLiveBrief(crypto: CryptoId): Promise<string | null> {
  const map = await refresh();
  const c = map?.get(crypto);
  if (!c) return null;

  const price = c.price >= 100 ? eur0.format(c.price) : eur2.format(c.price);
  const ath =
    c.athChangePct != null
      ? `${Math.abs(c.athChangePct).toFixed(0)} % sous son plus-haut`
      : "écart au plus-haut n/d";
  const cap =
    c.marketCap != null ? `cap. ≈ ${(c.marketCap / 1e9).toFixed(1)} Md€` : "";

  return [
    `MARCHÉ TEMPS RÉEL (source CoinGecko, EUR, à l'instant) — ${c.name} :`,
    `prix ≈ ${price} € ;`,
    `24h ${signedPct(c.change24h)} ;`,
    `7j ${signedPct(c.change7d)} ;`,
    `30j ${signedPct(c.change30d)} ;`,
    `${ath}${cap ? ` ; ${cap}` : ""}.`,
  ].join(" ");
}
