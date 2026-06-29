/**
 * Rate-limiting léger en mémoire (fenêtre glissante par clé).
 *
 * ⚠️ Limite : la mémoire n'est pas partagée entre instances serverless et se
 * réinitialise au cold start. Suffisant pour protéger une démo publique d'un
 * abus basique. En production, utiliser un store durable (Vercel KV / Upstash Redis).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter?: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

/** Identifie le client via l'IP (en-tête proxy Vercel), sinon "anon". */
export function clientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for") ?? "";
  return xff.split(",")[0]?.trim() || "anon";
}
