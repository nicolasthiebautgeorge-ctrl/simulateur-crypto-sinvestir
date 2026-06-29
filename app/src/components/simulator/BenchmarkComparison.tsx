import type { BenchmarkResult, SimulationResult } from "@/lib/simulation/types";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { CRYPTOS } from "@/lib/market-data/cryptoDataset";

interface BenchmarkComparisonProps {
  result: SimulationResult;
  benchmarks: BenchmarkResult[];
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-5 w-1 rounded-full bg-brand" />
      <h2 className="font-display text-lg font-semibold">{children}</h2>
    </div>
  );
}

interface Row {
  id: string;
  label: string;
  finalValue: number;
  profitPct: number;
  highlight: boolean;
}

function ComparisonRow({
  row,
  maxValue,
  currency,
}: {
  row: Row;
  maxValue: number;
  currency: string;
}) {
  const widthPct = maxValue > 0 ? Math.max(2, (row.finalValue / maxValue) * 100) : 0;
  const gain = row.profitPct >= 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`text-sm ${row.highlight ? "font-semibold text-text" : "text-text-muted"}`}
        >
          {row.label}
        </span>
        <span className="flex items-baseline gap-2">
          <span className="font-display text-sm font-semibold tabular-nums">
            {formatCurrency(row.finalValue, currency)}
          </span>
          <span
            className={`text-xs tabular-nums ${gain ? "text-success" : "text-error"}`}
          >
            {formatPercent(row.profitPct)}
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${row.highlight ? "bg-gold" : "bg-brand/70"}`}
          style={{ width: `${widthPct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/**
 * « Mise en perspective » — même montant, même période : crypto vs ETF Monde vs Livret A.
 * Contextualise le risque/rendement (ADN prudent S'investir), sans survendre la crypto.
 */
export function BenchmarkComparison({ result, benchmarks }: BenchmarkComparisonProps) {
  if (benchmarks.length === 0) return null;
  const { currency } = result;

  const rows: Row[] = [
    {
      id: result.crypto,
      label: CRYPTOS[result.crypto].name,
      finalValue: result.finalValue,
      profitPct: result.profitPct,
      highlight: true,
    },
    ...benchmarks.map((b) => ({
      id: b.id,
      label: b.label,
      finalValue: b.finalValue,
      profitPct: b.profitPct,
      highlight: false,
    })),
  ];

  const maxValue = Math.max(...rows.map((r) => r.finalValue));

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading>Mise en perspective</SectionHeading>
      <div className="rounded-2xl border border-white/10 bg-surface-soft/40 p-5">
        <p className="text-sm text-text-muted">
          À montant et période identiques, voici ce qu&apos;auraient donné d&apos;autres
          placements.
        </p>
        <div className="mt-4 flex flex-col gap-3.5">
          {rows.map((row) => (
            <ComparisonRow
              key={row.id}
              row={row}
              maxValue={maxValue}
              currency={currency}
            />
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-text-muted">
          ETF Monde et Livret A sont des repères pédagogiques approximatifs. La crypto peut
          surperformer… au prix d&apos;une volatilité bien supérieure (voir la pire chute
          ci-dessus).
        </p>
      </div>
    </div>
  );
}
