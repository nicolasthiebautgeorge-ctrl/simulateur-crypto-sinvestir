import { NextResponse } from "next/server";
import type { CryptoId } from "@/lib/simulation/types";
import { getLiveCoin } from "@/lib/market-data/liveMarket";
import { checkRateLimit, clientKey } from "@/lib/advisor/rateLimit";

const VALID: CryptoId[] = ["bitcoin", "ethereum", "solana"];

/**
 * Snapshot marché temps réel (proxy CoinGecko, cache mémoire côté serveur).
 * 204 si crypto invalide, rate-limit dépassé, ou données indisponibles
 * → l'UI masque simplement le bloc « prix live ».
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crypto = searchParams.get("crypto") as CryptoId | null;
  if (!crypto || !VALID.includes(crypto)) {
    return new NextResponse(null, { status: 204 });
  }

  const rl = checkRateLimit(`market:${clientKey(request)}`, 60, 60_000);
  if (!rl.ok) return new NextResponse(null, { status: 204 });

  const coin = await getLiveCoin(crypto);
  if (!coin) return new NextResponse(null, { status: 204 });

  return NextResponse.json(coin, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
}
