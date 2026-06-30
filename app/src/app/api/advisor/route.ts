import { NextResponse } from "next/server";
import type { AdvisorContext, AdvisorMessage } from "@/lib/advisor/types";
import { answerWithMock } from "@/lib/advisor/mockAdvisor";
import { checkRateLimit, clientKey } from "@/lib/advisor/rateLimit";
import { getLiveBrief } from "@/lib/market-data/liveMarket";

interface AdvisorRequestBody {
  messages: AdvisorMessage[];
  context: AdvisorContext;
}

const MAX_TOKENS = 320;

function systemPrompt(ctx: AdvisorContext): string {
  return [
    "Tu es le « Coach S'investir », un EXPERT crypto de très haut niveau et un coach confiant et motivant pour la marque française S'investir.",
    "TON & POSTURE :",
    "- Affirmé, chaleureux et inspirant : tu prends clairement position sur les bonnes pratiques, comme un expert en qui on a confiance.",
    "- Ta force vs un humain : tu raisonnes sur des données chiffrées, sans biais émotionnel ni peur ni euphorie. Tu restes lucide quand les autres paniquent ou s'emballent.",
    "- Tu assumes des recommandations de MÉTHODE et de COMPORTEMENT (discipline, régularité, horizon long, gestion du risque, diversification) avec conviction. Pas de langue de bois, pas de « ça dépend » mou.",
    "EXPERTISE CRYPTO (mobilise-la quand c'est pertinent) :",
    "- Cycles de marché : le Bitcoin suit des cycles d'environ 4 ans rythmés par le halving ; alternance de phases d'euphorie (bull) et de capitulation (bear) avec des replis de 70-85 % déjà observés.",
    "- Volatilité : c'est une caractéristique structurelle, pas une anomalie. Les altcoins (ETH, SOL) sont encore plus volatils que le BTC.",
    "- Facteurs de fluctuation : liquidité et taux (macro), adoption et flux (ETF, institutionnels), narratifs/technologie, régulation, effets de levier et liquidations.",
    "- Gestion du risque : taille de position adaptée, diversification, part raisonnable du patrimoine, horizon long, sécurité (cold wallet, vigilance arnaques/phishing), ne pas utiliser de levier quand on débute.",
    "- Le DCA lisse le prix d'entrée et neutralise le besoin de « timer » le marché ; il transforme la volatilité en alliée.",
    "- `marketBrief` = repères HISTORIQUES illustratifs (volatilité, ampleur des krachs, cycles) : sers-t'en pour expliquer la DYNAMIQUE, en ordres de grandeur, sans inventer de chiffres.",
    "- `liveMarket` (si présent) = situation ACTUELLE réelle (prix, variations 24h/7j/30j, écart au plus-haut). C'est LUI qui fait foi pour tout ce qui est « maintenant ». Ne donne aucun prix actuel non fourni par liveMarket.",
    "CADRE LÉGAL (à respecter sans alourdir le discours) :",
    "- Tu peux recommander des PRINCIPES et des MÉTHODES avec assurance, mais tu NE donnes PAS de conseil en investissement personnalisé : pas de « achète/vends tel actif maintenant » adapté à la situation perso de la personne (contrainte AMF).",
    "- Tu ne promets aucun rendement, tu ne garantis rien. Quand c'est utile (pas à chaque message), rappelle brièvement que les performances passées ne préjugent pas du futur.",
    "CONTENU :",
    "- Réponds en français, de façon concise (3 à 5 phrases), claire et orientée action.",
    "- Appuie-toi sur les chiffres réels de la simulation ci-dessous, sans les inventer.",
    "- Messages clés : la discipline bat l'émotion, l'horizon long, le DCA pour neutraliser le stress du timing, la diversification, n'investir que ce qu'on peut immobiliser.",
    "",
    "CONTEXTE DE LA SIMULATION (JSON) :",
    JSON.stringify(ctx),
  ].join("\n");
}

function chatMessages(messages: AdvisorMessage[], ctx: AdvisorContext) {
  const recent = messages.slice(-8);
  return [
    { role: "system" as const, content: systemPrompt(ctx) },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
  ];
}

/** OpenAI (prioritaire) — meilleur français. Renvoie null si pas de clé. */
async function callOpenAI(
  messages: AdvisorMessage[],
  ctx: AdvisorContext,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
  // La gamme GPT-5 n'accepte plus `max_tokens` (→ `max_completion_tokens`)
  // ni une `temperature` personnalisée : on omet ce paramètre.
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: MAX_TOKENS,
      messages: chatMessages(messages, ctx),
    }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const data = await res.json();
  const reply: string | undefined = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error("Empty OpenAI reply");
  return reply.trim();
}

/** Groq (secondaire) — tier gratuit. Renvoie null si pas de clé. */
async function callGroq(
  messages: AdvisorMessage[],
  ctx: AdvisorContext,
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: MAX_TOKENS,
      messages: chatMessages(messages, ctx),
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
  const data = await res.json();
  const reply: string | undefined = data?.choices?.[0]?.message?.content;
  if (!reply) throw new Error("Empty Groq reply");
  return reply.trim();
}

export async function POST(request: Request) {
  let body: AdvisorRequestBody;
  try {
    body = (await request.json()) as AdvisorRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const context = body?.context;
  if (!context) {
    return NextResponse.json({ error: "Missing context" }, { status: 400 });
  }

  // Garde-fou : au-delà de la limite, on sert le mock (protège la clé payante).
  const rl = checkRateLimit(`advisor:${clientKey(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(answerWithMock(messages, context));
  }

  // Enrichit le contexte avec un snapshot marché temps réel (best-effort).
  const live = await getLiveBrief(context.cryptoId);
  const enriched = live ? { ...context, liveMarket: live } : context;

  const usingOpenAI = Boolean(process.env.OPENAI_API_KEY);
  try {
    const reply =
      (await callOpenAI(messages, enriched)) ??
      (await callGroq(messages, enriched));
    if (reply) {
      return NextResponse.json({
        reply,
        source: usingOpenAI ? "openai" : "groq",
      });
    }
  } catch {
    // Erreur LLM (quota, réseau, modèle invalide…) → fallback mock silencieux.
  }

  return NextResponse.json(answerWithMock(messages, enriched));
}
