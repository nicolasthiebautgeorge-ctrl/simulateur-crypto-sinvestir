import type { SimulationResult } from "@/lib/simulation/types";
import {
  formatCurrency,
  formatPercent,
  formatQuantity,
  formatSignedCurrency,
} from "@/lib/formatters";
import { CRYPTOS } from "@/lib/market-data/cryptoDataset";

interface ResultsCardsProps {
  result: SimulationResult;
}

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "gain" | "loss";
}

function Stat({ label, value, sub, tone = "neutral" }: StatProps) {
  const valueColor =
    tone === "gain" ? "text-success" : tone === "loss" ? "text-error" : "text-text";
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-soft/40 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-text-muted">{sub}</p> : null}
    </div>
  );
}

export function ResultsCards({ result }: ResultsCardsProps) {
  const { currency } = result;
  const isGain = result.profit >= 0;
  const tone = isGain ? "gain" : "loss";
  const symbol = CRYPTOS[result.crypto].symbol;

  const purchasesLabel =
    result.frequency === "one-shot"
      ? "Achat unique"
      : `${result.purchases} versements`;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Stat
        label="Montant total investi"
        value={formatCurrency(result.totalInvested, currency)}
        sub={purchasesLabel}
      />
      <Stat
        label="Valeur finale"
        value={formatCurrency(result.finalValue, currency)}
        sub={`${formatQuantity(result.quantity)} ${symbol}`}
        tone={tone}
      />
      <Stat
        label="Plus / moins-value"
        value={formatSignedCurrency(result.profit, currency)}
        tone={tone}
      />
      <Stat
        label="Rendement"
        value={formatPercent(result.profitPct)}
        tone={tone}
      />
    </div>
  );
}
