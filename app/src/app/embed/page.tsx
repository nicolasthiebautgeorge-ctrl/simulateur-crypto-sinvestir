import type { Metadata } from "next";
import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";
import type { CryptoId, Frequency, SimulationInput } from "@/lib/simulation/types";

export const metadata: Metadata = {
  title: "Simulateur Crypto — embed",
  robots: { index: false, follow: false },
};

const CRYPTO_IDS: CryptoId[] = ["bitcoin", "ethereum", "solana"];
const FREQUENCIES: Frequency[] = ["one-shot", "daily", "weekly", "monthly"];

type SearchParams = Record<string, string | string[] | undefined>;

/** Construit les valeurs initiales du simulateur depuis les paramètres d'URL (config d'embed). */
function parseInitialInput(sp: SearchParams): Partial<SimulationInput> {
  const get = (key: string): string | undefined => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const out: Partial<SimulationInput> = {};

  const crypto = get("crypto");
  if (crypto && CRYPTO_IDS.includes(crypto as CryptoId)) {
    out.crypto = crypto as CryptoId;
  }

  const frequency = get("frequency");
  if (frequency && FREQUENCIES.includes(frequency as Frequency)) {
    out.frequency = frequency as Frequency;
  }

  const amount = Number(get("amount"));
  if (Number.isFinite(amount) && amount > 0) {
    out.amount = amount;
  }

  const start = get("start");
  if (start) out.startDate = start;

  const end = get("end");
  if (end) out.endDate = end;

  return out;
}

/**
 * Page d'embed légère (iframe-friendly) : uniquement le simulateur, sans header ni hero.
 * Configurable via l'URL, ex. /embed?crypto=ethereum&frequency=monthly&amount=50&start=2021-01-01&end=2026-06-01
 */
export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const initialInput = parseInitialInput(sp);

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6">
      <CryptoSimulator initialInput={initialInput} />
      <p className="mt-4 text-center text-xs text-text-muted">
        Simulateur S&apos;investir — backtest pédagogique, ne constitue pas un conseil en
        investissement.
      </p>
    </main>
  );
}
