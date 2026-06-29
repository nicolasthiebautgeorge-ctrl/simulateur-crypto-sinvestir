/**
 * Types du domaine — simulateur de backtest crypto.
 * Logique pure, indépendante de React et de la source de données.
 */

export type CryptoId = "bitcoin" | "ethereum" | "solana";

/** Achat unique ou versements réguliers (DCA). */
export type Frequency = "one-shot" | "daily" | "weekly" | "monthly";

export interface CryptoMeta {
  id: CryptoId;
  symbol: string;
  name: string;
}

/** Point de prix historique : date ISO (YYYY-MM-DD) + prix dans la devise du dataset. */
export interface PricePoint {
  date: string;
  price: number;
}

/** Plage de données disponible pour un actif. */
export interface DateRange {
  start: string;
  end: string;
}

/** Paramètres saisis par l'utilisateur. */
export interface SimulationInput {
  crypto: CryptoId;
  /** Montant par achat (one-shot) ou par versement (DCA), dans la devise du dataset. */
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
}

/** Un point de la courbe d'évolution (pour le graphique). */
export interface TimelinePoint {
  date: string;
  /** Cumul investi à cette date. */
  invested: number;
  /** Valeur du portefeuille (investisseur discipliné qui conserve). */
  value: number;
  /**
   * Patrimoine de l'investisseur « paniqué » qui a tout vendu au pire creux puis
   * gardé ses versements en cash. Sert à superposer les deux trajectoires.
   */
  panicValue: number;
}

/**
 * Scénario comportemental : on quantifie le coût d'avoir paniqué.
 * L'investisseur vend la totalité de ses positions au plus bas du plus gros krach,
 * puis conserve ses versements suivants en cash (il ne rachète jamais).
 */
export interface PanicScenario {
  /** Date de la vente panique (creux du plus fort drawdown). */
  sellDate: string;
  /** Patrimoine final de l'investisseur paniqué (cash). */
  finalValue: number;
  /** Manque à gagner vs l'investisseur discipliné (peut être négatif). */
  costOfPanic: number;
}

/**
 * Résultat d'un placement de comparaison (ETF Monde, Livret A) sur le MÊME scénario
 * (même montants, même calendrier, même période) que la crypto simulée.
 */
export interface BenchmarkResult {
  id: string;
  label: string;
  totalInvested: number;
  finalValue: number;
  profit: number;
  profitPct: number;
}

/** Indicateurs de risque/volatilité sur la période (honnêteté pédagogique). */
export interface RiskMetrics {
  /** Plus forte baisse pic→creux du cours sur la période (valeur négative, en %). */
  maxDrawdownPct: number;
  /** Date du pic précédant le plus gros drawdown. */
  maxDrawdownPeakDate: string;
  /** Date du creux du plus gros drawdown. */
  maxDrawdownTroughDate: string;
  /** Part du temps où le portefeuille valait moins que l'investi (en %). */
  timeUnderwaterPct: number;
}

/** Avertissement non bloquant (ex. dates ajustées à la plage disponible). */
export interface SimulationWarning {
  code:
    | "DATES_CLAMPED"
    | "START_AFTER_END"
    | "NO_DATA"
    | "INVALID_AMOUNT";
  message: string;
}

/** Résultat complet d'une simulation. */
export interface SimulationResult {
  crypto: CryptoId;
  frequency: Frequency;
  /** Devise des montants (dataset). */
  currency: string;
  /** Période réellement utilisée (après ajustement à la plage de données). */
  effectiveRange: DateRange;
  /** Nombre d'achats simulés. */
  purchases: number;
  /** Quantité totale de crypto accumulée. */
  quantity: number;
  /** Somme totale investie. */
  totalInvested: number;
  /** Valeur finale du portefeuille. */
  finalValue: number;
  /** Plus/moins-value en devise. */
  profit: number;
  /** Plus/moins-value en pourcentage. */
  profitPct: number;
  /** Série pour le graphique (investi vs valeur vs panique). */
  timeline: TimelinePoint[];
  /** Indicateurs de risque (max drawdown, temps en moins-value). */
  risk: RiskMetrics;
  /** Scénario « panique » (coût de la vente au pire moment). */
  panic: PanicScenario;
  warnings: SimulationWarning[];
}
