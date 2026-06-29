import { NextResponse } from "next/server";
import type { AdvisorContext, AdvisorMessage } from "@/lib/advisor/types";
import { answerWithMock } from "@/lib/advisor/mockAdvisor";

interface AdvisorRequestBody {
  messages: AdvisorMessage[];
  context: AdvisorContext;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function systemPrompt(ctx: AdvisorContext): string {
  return [
    "Tu es le « Coach S'investir », un assistant pédagogique en investissement crypto pour la marque française S'investir.",
    "RÈGLES STRICTES :",
    "- Tu NE donnes JAMAIS de conseil en investissement personnalisé (contrainte réglementaire AMF). Tu expliques, tu éduques, tu mets en perspective.",
    "- Tu réponds en français, ton bienveillant et clair, de façon concise (4 à 6 phrases max).",
    "- Tu t'appuies sur les chiffres réels de la simulation ci-dessous, sans les inventer.",
    "- Tu rappelles, quand c'est pertinent, que les performances passées ne préjugent pas du futur.",
    "- Messages clés de la marque : discipline > émotion, horizon long, DCA pour éviter le stress du timing, diversification, n'investir que ce qu'on peut immobiliser.",
    "",
    "CONTEXTE DE LA SIMULATION (JSON) :",
    JSON.stringify(ctx),
  ].join("\n");
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

  const apiKey = process.env.GROQ_API_KEY;

  // Pas de clé → fallback mock (la démo marche toujours).
  if (!apiKey) {
    return NextResponse.json(answerWithMock(messages, context));
  }

  try {
    const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    const recent = messages.slice(-8);
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        max_tokens: 320,
        messages: [
          { role: "system", content: systemPrompt(context) },
          ...recent.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = await res.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty Groq reply");

    return NextResponse.json({ reply: reply.trim(), source: "groq" });
  } catch {
    // Toute erreur LLM (quota, réseau…) → fallback mock silencieux.
    return NextResponse.json(answerWithMock(messages, context));
  }
}
