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
  /** Valeur du portefeuille à cette date. */
  value: number;
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
  /** Série pour le graphique (investi vs valeur). */
  timeline: TimelinePoint[];
  warnings: SimulationWarning[];
}
