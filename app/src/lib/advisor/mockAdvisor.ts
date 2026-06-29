import type {
  AdvisorContext,
  AdvisorMessage,
  AdvisorReply,
} from "@/lib/advisor/types";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "@/lib/formatters";

/** Normalise pour la détection d'intention (minuscules, sans accents). */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function has(text: string, ...needles: string[]): boolean {
  return needles.some((n) => text.includes(n));
}

const DISCLAIMER =
  "ℹ️ Ceci est pédagogique, pas un conseil en investissement personnalisé.";

function summary(ctx: AdvisorContext): string {
  const cur = ctx.currency;
  return `Sur ${ctx.cryptoLabel} en ${ctx.frequencyLabel} (${ctx.periodLabel}), tu aurais investi ${formatCurrency(
    ctx.totalInvested,
    cur,
  )} pour une valeur finale de ${formatCurrency(ctx.finalValue, cur)}, soit ${formatPercent(
    ctx.profitPct,
  )}.`;
}

/**
 * Coach pédagogique déterministe : répond à partir des vrais chiffres de la simulation.
 * Sert de fallback fiable quand aucun LLM n'est configuré (la démo ne casse jamais).
 */
export function answerWithMock(
  messages: AdvisorMessage[],
  ctx: AdvisorContext,
): AdvisorReply {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text = normalize(lastUser?.content ?? "");
  const cur = ctx.currency;

  // Accueil / aucune question
  if (
    !text ||
    has(text, "bonjour", "salut", "coucou", "hello", "hey", "ca va")
  ) {
    return {
      source: "mock",
      reply: `Bonjour 👋 Je suis ton coach S'investir. ${summary(
        ctx,
      )} Pose-moi une question : risque, panique, DCA, ou comparaison avec un ETF.`,
    };
  }

  // Risque / volatilité
  if (
    has(
      text,
      "risqu",
      "volatil",
      "chute",
      "drawdown",
      "perdre",
      "perte",
      "danger",
      "baisse",
    )
  ) {
    return {
      source: "mock",
      reply: `La crypto est très volatile. Sur cette période, la pire chute traversée a été de ${formatPercent(
        ctx.maxDrawdownPct,
      )}, et le portefeuille est resté en moins-value ${Math.round(
        ctx.timeUnderwaterPct,
      )} % du temps. La règle d'or : n'investir que ce qu'on peut immobiliser longtemps et accepter de perdre. ${DISCLAIMER}`,
    };
  }

  // Panique / vendre dans la peur
  if (
    has(
      text,
      "paniqu",
      "vendre",
      "peur",
      "stress",
      "krach",
      "crash",
      "tout revendre",
      "sortir",
    )
  ) {
    return {
      source: "mock",
      reply: `C'est LA leçon clé : vendre au pire moment (${ctx.panicSellDateLabel}) puis rester à l'écart aurait coûté ${formatSignedCurrency(
        ctx.panicCost,
        cur,
      )} par rapport à l'investisseur resté discipliné. Le marché ne prévient pas quand il rebondit — c'est le temps passé investi, pas le timing, qui fait la performance. ${DISCLAIMER}`,
    };
  }

  // DCA vs achat unique
  if (
    has(
      text,
      "dca",
      "regulier",
      "mensuel",
      "lissage",
      "lisser",
      "achat unique",
      "une fois",
      "timing",
      "moment",
      "quand investir",
    )
  ) {
    return {
      source: "mock",
      reply: `Le DCA (versements réguliers) lisse le prix d'achat : tu achètes plus quand c'est bas, moins quand c'est haut, sans devoir deviner le bon moment. C'est plus serein psychologiquement et ça réduit le risque de « tout placer au plus haut ». Ton scénario actuel : ${ctx.frequencyLabel}. ${DISCLAIMER}`,
    };
  }

  // Comparaison avec d'autres placements
  if (
    has(
      text,
      "etf",
      "livret",
      "bourse",
      "action",
      "comparer",
      "comparaison",
      "mieux",
      "msci",
      "world",
      "alternative",
    )
  ) {
    const bench = ctx.benchmarks
      .map((b) => `${b.label} : ${formatPercent(b.profitPct)}`)
      .join(", ");
    return {
      source: "mock",
      reply: `À montant et période identiques : ${ctx.cryptoLabel} ${formatPercent(
        ctx.profitPct,
      )}${bench ? ` · ${bench}` : ""}. La crypto peut surperformer, mais au prix d'une volatilité bien supérieure (cf. la pire chute de ${formatPercent(
        ctx.maxDrawdownPct,
      )}). Diversifier reste la base. ${DISCLAIMER}`,
    };
  }

  // Demande de conseil direct → on recadre (pas de conseil perso)
  if (
    has(
      text,
      "conseil",
      "acheter",
      "dois-je",
      "dois je",
      "que faire",
      "recommand",
      "investir maintenant",
      "vaut-il",
      "vaut il",
      "faut-il",
      "faut il",
      "rentable",
    )
  ) {
    return {
      source: "mock",
      reply: `Je ne donne pas de conseil personnalisé — mais voici la méthode S'investir : définis un horizon long, n'investis que ce que tu peux immobiliser, privilégie le DCA pour éviter le stress du timing, et diversifie. La discipline bat l'émotion (ici, paniquer aurait coûté ${formatSignedCurrency(
        ctx.panicCost,
        cur,
      )}). ${DISCLAIMER}`,
    };
  }

  // Fallback : résumé + relance
  return {
    source: "mock",
    reply: `${summary(
      ctx,
    )} Tu peux me demander : « quel est le risque ? », « et si j'avais paniqué ? », « pourquoi le DCA ? » ou « c'est mieux qu'un ETF ? ». ${DISCLAIMER}`,
  };
}
