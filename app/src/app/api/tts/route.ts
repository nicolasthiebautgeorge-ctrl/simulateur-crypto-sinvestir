import { NextResponse } from "next/server";
import { checkRateLimit, clientKey } from "@/lib/advisor/rateLimit";

/** Longueur max envoyée au TTS (maîtrise du coût). */
const MAX_CHARS = 600;

/**
 * Voix neuronale via OpenAI TTS. Renvoie un mp3 (audio/mpeg).
 * Si aucune clé, rate-limit dépassé, ou erreur → 204 : le client retombe sur
 * la synthèse vocale gratuite du navigateur (Web Speech API).
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new NextResponse(null, { status: 204 });

  const rl = checkRateLimit(`tts:${clientKey(request)}`, 30, 60_000);
  if (!rl.ok) return new NextResponse(null, { status: 204 });

  let text = "";
  try {
    const body = (await request.json()) as { text?: string };
    text = (body?.text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!text) return new NextResponse(null, { status: 204 });

  const model = process.env.OPENAI_TTS_MODEL ?? "tts-1-hd";
  const voice = process.env.OPENAI_TTS_VOICE ?? "alloy";

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        input: text.slice(0, MAX_CHARS),
        response_format: "mp3",
      }),
    });
    if (!res.ok) return new NextResponse(null, { status: 204 });

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
