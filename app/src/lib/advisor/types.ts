/**
 * Couche « Coach IA » — abstraction indépendante du fournisseur (mock ou LLM).
 * Même principe que `MarketDataProvider` : le composant ne dépend pas de l'implémentation.
 */

import type { CryptoId } from "@/lib/simulation/types";

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
  cryptoId: CryptoId;
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
  /** Repères de fluctuation réels (volatilité, krachs…) issus du dataset. */
  marketBrief: string;
  /** Snapshot marché temps réel (rempli côté serveur via CoinGecko). */
  liveMarket?: string;
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
