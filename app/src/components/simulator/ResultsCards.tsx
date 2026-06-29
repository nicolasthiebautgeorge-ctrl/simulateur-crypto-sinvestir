import type { SimulationResult } from "@/lib/simulation/types";
import {
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatQuantity,
  formatSignedCurrency,
} from "@/lib/formatters";
import { CRYPTOS } from "@/lib/market-data/cryptoDataset";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface ResultsCardsProps {
  result: SimulationResult;
}

/** En-tête de section avec barre d'accent verticale bleue (style S'investir). */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-5 w-1 rounded-full bg-brand" />
      <h2 className="font-display text-lg font-semibold">{children}</h2>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "gain" | "loss";
}

function MiniStat({ label, value, sub, tone = "neutral" }: MiniStatProps) {
  const valueColor =
    tone === "gain" ? "text-success" : tone === "loss" ? "text-error" : "text-text";
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-soft/40 p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-xl font-semibold tracking-tight tabular-nums sm:text-2xl ${valueColor}`}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-text-muted">{sub}</p> : null}
    </div>
  );
}

/** Barre empilée : part investie vs plus-value (gain) ou valeur restante vs perte (perte). */
function CompositionBar({ result }: { result: SimulationResult }) {
  const { currency, totalInvested, finalValue, profit } = result;
  const isGain = profit >= 0;
  const total = isGain ? finalValue : totalInvested;
  const safeTotal = total > 0 ? total : 1;

  const primaryPct = (isGain ? totalInvested : finalValue) / safeTotal * 100;
  const accentPct = Math.max(0, 100 - primaryPct);

  return (
    <div className="mt-4">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-brand"
          style={{ width: `${primaryPct}%` }}
          aria-hidden
        />
        <div
          className={`h-full ${isGain ? "bg-gold" : "bg-error"}`}
          style={{ width: `${accentPct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5 text-text-muted">
          <span className="h-2 w-2 rounded-full bg-brand" />
          {isGain ? "Somme investie" : "Valeur restante"}{" "}
          <span className="font-medium text-text-subtle">
            {formatCurrency(isGain ? totalInvested : finalValue, currency)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-text-muted">
          <span className={`h-2 w-2 rounded-full ${isGain ? "bg-gold" : "bg-error"}`} />
          {isGain ? "Plus-value" : "Perte"}{" "}
          <span
            className={`font-medium ${isGain ? "text-gold" : "text-error"}`}
          >
            {formatSignedCurrency(profit, currency)}
          </span>
        </span>
      </div>
    </div>
  );
}

function buildSummary(result: SimulationResult): string {
  const { currency, totalInvested, finalValue, profit, profitPct } = result;
  const name = CRYPTOS[result.crypto].name;
  const start = formatDateLabel(result.effectiveRange.start);
  const end = formatDateLabel(result.effectiveRange.end);

  const strategy =
    result.frequency === "one-shot"
      ? `un investissement unique de ${formatCurrency(totalInvested, currency)}`
      : `des versements réguliers (${result.purchases} achats, ${formatCurrency(
          totalInvested,
          currency,
        )} au total)`;

  const verb = profit >= 0 ? "une plus-value" : "une moins-value";

  return `Avec ${strategy} sur ${name} entre ${start} et ${end}, votre portefeuille vaudrait ${formatCurrency(
    finalValue,
    currency,
  )}, soit ${verb} de ${formatSignedCurrency(profit, currency)} (${formatPercent(
    profitPct,
  )}).`;
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
    <div className="flex flex-col gap-4">
      <SectionHeading>Vos résultats</SectionHeading>

      {/* Carte principale : valeur finale + composition */}
      <div className="rounded-2xl border border-white/10 bg-surface-soft/40 p-5">
        <p className="text-xs text-text-muted">Valeur finale du portefeuille</p>
        <AnimatedNumber
          value={result.finalValue}
          format={(n) => formatCurrency(n, currency)}
          className={`mt-1 block font-display text-3xl font-semibold tracking-tight tabular-nums ${
            isGain ? "text-success" : "text-error"
          }`}
        />
        <p className="mt-0.5 text-xs text-text-muted">
          {formatQuantity(result.quantity)} {symbol}
        </p>
        <CompositionBar result={result} />
      </div>

      {/* Indicateurs secondaires */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MiniStat
          label="Montant investi"
          value={formatCurrency(result.totalInvested, currency)}
          sub={purchasesLabel}
        />
        <MiniStat
          label="Plus / moins-value"
          value={formatSignedCurrency(result.profit, currency)}
          tone={tone}
        />
        <MiniStat
          label="Rendement"
          value={formatPercent(result.profitPct)}
          tone={tone}
        />
      </div>

      <p className="text-sm leading-relaxed text-text-muted">
        {buildSummary(result)}
      </p>
    </div>
  );
}
