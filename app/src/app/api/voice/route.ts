import { NextResponse } from "next/server";
import type { AdvisorContext, AdvisorMessage } from "@/lib/advisor/types";
import { checkRateLimit, clientKey } from "@/lib/advisor/rateLimit";

interface VoiceRequestBody {
  messages: AdvisorMessage[];
  context: AdvisorContext;
}

/**
 * Mode vocal « nouvelle génération » : un modèle audio natif (gpt-audio)
 * génère la réponse ET sa voix réaliste (marin/cedar) en un seul appel.
 * On renvoie la transcription (pour la bulle) + l'audio mp3 en base64.
 *
 * Repli : 204 si pas de clé, rate-limit dépassé, ou erreur → le client
 * bascule sur le chemin texte (/api/advisor) + voix tts-1-hd.
 */

function systemPrompt(ctx: AdvisorContext): string {
  return [
    "Tu es le « Coach S'investir », un EXPERT crypto de très haut niveau et un coach vocal confiant et motivant pour la marque française S'investir.",
    "Tu PARLES (sortie audio) : style oral, naturel, chaleureux, posé et assuré — comme un expert qui inspire confiance.",
    "TON & POSTURE :",
    "- Affirmé et inspirant : tu prends clairement position, tu encourages, tu donnes envie d'agir avec méthode.",
    "- Ta force vs un humain : tu raisonnes sur des données chiffrées, sans biais émotionnel ; tu restes lucide quand les autres paniquent ou s'emballent.",
    "- Tu assumes des recommandations de MÉTHODE et de COMPORTEMENT (discipline, régularité, horizon long, gestion du risque) avec conviction. Pas de « ça dépend » mou.",
    "EXPERTISE CRYPTO (mobilise-la quand c'est pertinent) :",
    "- Cycles d'environ 4 ans rythmés par le halving du Bitcoin ; replis de 70 à 85 pour cent déjà observés ; volatilité structurelle (les altcoins comme Ethereum ou Solana encore plus).",
    "- Fluctuations dues à la macro et aux taux, à l'adoption et aux flux, aux narratifs et à la régulation, à l'effet de levier.",
    "- Gestion du risque : taille de position raisonnable, diversification, horizon long, sécurité du portefeuille, pas de levier quand on débute. Le DCA transforme la volatilité en alliée.",
    "- Appuie-toi sur les repères de fluctuation réels fournis dans le contexte (marketBrief), en ordres de grandeur, sans inventer de chiffres.",
    "CADRE LÉGAL (sans alourdir le discours) :",
    "- Tu recommandes des principes et des méthodes avec assurance, mais PAS de conseil en investissement personnalisé : pas de « achète ou vends tel actif maintenant » adapté à la situation de la personne (AMF).",
    "- Aucune promesse de rendement. Quand c'est utile (pas à chaque fois), rappelle brièvement que le passé ne préjuge pas du futur.",
    "CONTENU :",
    "- Réponds en français, en 2 à 4 phrases courtes, faciles à écouter, orientées action.",
    "- Pas de markdown, pas d'astérisques, pas d'émojis, pas de listes : que du texte parlé.",
    "- Appuie-toi sur les chiffres réels de la simulation ci-dessous, sans les inventer.",
    "- Messages clés : la discipline bat l'émotion, l'horizon long, le DCA pour neutraliser le stress du timing, n'investir que ce qu'on peut immobiliser.",
    "",
    "CONTEXTE DE LA SIMULATION (JSON) :",
    JSON.stringify(ctx),
  ].join("\n");
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new NextResponse(null, { status: 204 });

  // Mode vocal coûteux → limite plus stricte que le texte.
  const rl = checkRateLimit(`voice:${clientKey(request)}`, 12, 60_000);
  if (!rl.ok) return new NextResponse(null, { status: 204 });

  let body: VoiceRequestBody;
  try {
    body = (await request.json()) as VoiceRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const context = body?.context;
  if (!context) {
    return NextResponse.json({ error: "Missing context" }, { status: 400 });
  }

  const model = process.env.OPENAI_AUDIO_MODEL ?? "gpt-audio-mini";
  const voice = process.env.OPENAI_AUDIO_VOICE ?? "marin";
  const recent = messages.slice(-8);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        modalities: ["text", "audio"],
        audio: { voice, format: "mp3" },
        messages: [
          { role: "system", content: systemPrompt(context) },
          ...recent.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!res.ok) return new NextResponse(null, { status: 204 });

    const data = await res.json();
    const audio = data?.choices?.[0]?.message?.audio;
    const reply: string | undefined = audio?.transcript;
    const audioB64: string | undefined = audio?.data;
    if (!reply || !audioB64) return new NextResponse(null, { status: 204 });

    return NextResponse.json({ reply: reply.trim(), audio: audioB64 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
