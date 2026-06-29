/**
 * Couche « Coach IA » — abstraction indépendante du fournisseur (mock ou LLM).
 * Même principe que `MarketDataProvider` : le composant ne dépend pas de l'implémentation.
 */

export type AdvisorRole = "user" | "assistant";

export interface AdvisorMessage {
  role: AdvisorRole;
  content: string;
}

/**
 * Contexte compact d'une simulation, envoyé au coach (pas la timeline complète).
 * Sert de « mémoire » factuelle : le coach raisonne sur ces chiffres réels.
 */
export interface AdvisorContext {
  cryptoLabel: string;
  frequencyLabel: string;
  periodLabel: string;
  currency: string;
  totalInvested: number;
  finalValue: number;
  profit: number;
  profitPct: number;
  maxDrawdownPct: number;
  timeUnderwaterPct: number;
  panicCost: number;
  panicSellDateLabel: string;
  benchmarks: { label: string; finalValue: number; profitPct: number }[];
}

export interface AdvisorReply {
  reply: string;
  /** Origine de la réponse (utile pour la démo / le debug). */
  source: "openai" | "groq" | "mock";
}

/** Contrat commun mock / LLM. */
export interface AdvisorProvider {
  answer(
    messages: AdvisorMessage[],
    context: AdvisorContext,
  ): Promise<AdvisorReply>;
}
