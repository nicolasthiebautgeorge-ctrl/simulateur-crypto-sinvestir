import type { SimulationResult } from "@/lib/simulation/types";
import {
  formatCurrency,
  formatDateLabel,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/formatters";

interface BehaviorInsightProps {
  result: SimulationResult;
}

/** En-tête de section avec barre d'accent verticale (style S'investir). */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-5 w-1 rounded-full bg-gold" />
      <h2 className="font-display text-lg font-semibold">{children}</h2>
    </div>
  );
}

/**
 * « Discipline vs Émotion » — cœur pédagogique (Evidence-Based Investing).
 * On chiffre ce qu'aurait coûté la panique : tout vendre au pire creux puis rester en cash.
 */
export function BehaviorInsight({ result }: BehaviorInsightProps) {
  const { currency, finalValue, panic, risk } = result;
  const disciplined = finalValue;
  const panicked = panic.finalValue;
  const cost = panic.costOfPanic;

  // Multiple : combien de fois la discipline rapporte vs la panique.
  const multiple = panicked > 0 ? disciplined / panicked : null;
  const panicMattered = cost > 1 && disciplined > panicked;

  const coach = panicMattered
    ? `Vendre au plus bas (${formatDateLabel(
        panic.sellDate,
      )}) puis rester à l'écart aurait coûté ${formatSignedCurrency(
        -Math.abs(cost),
        currency,
      )}. Le marché ne prévient pas quand il rebondit : c'est le temps passé investi, pas le timing, qui fait la performance.`
    : `Sur cette période, la trajectoire est restée proche quoi qu'il arrive. Le vrai risque à gérer reste la volatilité : il fallait encaisser une baisse de ${formatPercent(
        risk.maxDrawdownPct,
      )} sans vendre.`;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading>Discipline vs émotion</SectionHeading>

      <div className="rounded-2xl border border-gold/25 bg-gold/[0.04] p-5">
        <p className="text-sm font-medium text-gold">
          Et si vous aviez paniqué au pire moment ?
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-surface-soft/40 p-4">
            <p className="text-xs text-text-muted">En gardant le cap (discipline)</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-success">
              {formatCurrency(disciplined, currency)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-surface-soft/40 p-4">
            <p className="text-xs text-text-muted">
              En vendant au creux ({formatDateLabel(panic.sellDate)})
            </p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-text-subtle">
              {formatCurrency(panicked, currency)}
            </p>
          </div>
        </div>

        {panicMattered ? (
          <p className="mt-3 text-sm">
            <span className="text-text-muted">Coût de la panique : </span>
            <span className="font-semibold text-error">
              {formatSignedCurrency(-Math.abs(cost), currency)}
            </span>
            {multiple && multiple >= 1.1 ? (
              <span className="text-text-muted">
                {" "}
                — la discipline rapporte{" "}
                <span className="font-semibold text-success">
                  ×{multiple.toFixed(1).replace(".", ",")}
                </span>{" "}
                de plus.
              </span>
            ) : null}
          </p>
        ) : null}

        <p className="mt-3 text-sm leading-relaxed text-text-muted">{coach}</p>
      </div>

      {/* Stress-test honnête : la trouille qu'il fallait encaisser. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface-soft/40 p-4">
          <p className="text-xs text-text-muted">Pire chute traversée (max drawdown)</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-error sm:text-2xl">
            {formatPercent(risk.maxDrawdownPct)}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {formatDateLabel(risk.maxDrawdownPeakDate)} →{" "}
            {formatDateLabel(risk.maxDrawdownTroughDate)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface-soft/40 p-4">
          <p className="text-xs text-text-muted">Temps passé en moins-value</p>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-text sm:text-2xl">
            {Math.round(risk.timeUnderwaterPct)} %
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            de la période sous le montant investi
          </p>
        </div>
      </div>
    </div>
  );
}
