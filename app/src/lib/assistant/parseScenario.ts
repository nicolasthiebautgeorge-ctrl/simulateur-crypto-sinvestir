import type { CryptoId, Frequency, SimulationInput } from "@/lib/simulation/types";

/**
 * Parseur d'intention en langage naturel → paramètres de simulation.
 *
 * Implémentation 100 % locale (règles + regex), déterministe et sans dépendance réseau :
 * la démo ne peut pas casser. L'interface `ScenarioParser` est volontairement isolée pour
 * brancher plus tard un vrai LLM (route API serveur) sans toucher à l'UI — pensée « agent ».
 */
export interface ParsedScenario {
  patch: Partial<SimulationInput>;
  /** Libellés de ce qui a été compris, pour le feedback UI. */
  understood: string[];
}

export interface ScenarioParser {
  parse(text: string): ParsedScenario;
}

const MONTHS: Record<string, number> = {
  janvier: 1, "janv": 1, fevrier: 2, "février": 2, fevr: 2, "févr": 2,
  mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, juil: 7,
  aout: 8, "août": 8, septembre: 9, sept: 9, octobre: 10, oct: 10,
  novembre: 11, nov: 11, decembre: 12, "décembre": 12, dec: 12, "déc": 12,
};

const MONTH_LABELS = [
  "", "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function detectCrypto(text: string): { id: CryptoId; label: string } | null {
  if (/\b(bitcoin|btc)\b/i.test(text)) return { id: "bitcoin", label: "Bitcoin" };
  if (/\b(ethereum|ether|eth)\b/i.test(text)) return { id: "ethereum", label: "Ethereum" };
  if (/\b(solana|sol)\b/i.test(text)) return { id: "solana", label: "Solana" };
  return null;
}

function detectFrequency(text: string): { value: Frequency; label: string } | null {
  if (/(achat unique|une seule fois|d['’ ]un coup|en une fois|tout d['’ ]un coup|one[- ]?shot|lump)/i.test(text))
    return { value: "one-shot", label: "achat unique" };
  if (/\b(semaines?|hebdo|hebdomadaire|weekly)\b/i.test(text))
    return { value: "weekly", label: "DCA hebdo" };
  if (/\b(jours?|quotidiens?|quotidienne|daily)\b/i.test(text))
    return { value: "daily", label: "DCA quotidien" };
  if (/\b(mois|mensuels?|mensuelle|monthly)\b/i.test(text))
    return { value: "monthly", label: "DCA mensuel" };
  return null;
}

const YEAR_RE = /\b(19|20)\d{2}\b/g;

function detectAmount(text: string): number | null {
  // 1) Nombre suivi d'un marqueur monétaire (« 100 € », « 50 euros »).
  const withCurrency = text.match(/(\d[\d\s.,]*)\s*(€|eur\b|euros?)/i);
  if (withCurrency) return toNumber(withCurrency[1]);

  // 2) Sinon, premier nombre qui n'est pas une année.
  const numbers = text.match(/\d[\d\s.,]*/g) ?? [];
  for (const raw of numbers) {
    const cleaned = raw.trim();
    if (/^(19|20)\d{2}$/.test(cleaned.replace(/[\s.,]/g, ""))) continue;
    const n = toNumber(cleaned);
    if (n != null && n > 0) return n;
  }
  return null;
}

function toNumber(raw: string): number | null {
  let s = raw.replace(/\s/g, "");
  // « 1 000,50 » → décimale virgule ; « 1,000 » improbable ici → on privilégie la virgule décimale.
  if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function detectMonth(text: string): number | null {
  for (const [name, idx] of Object.entries(MONTHS)) {
    if (new RegExp(`\\b${name}\\b`, "i").test(text)) return idx;
  }
  return null;
}

function iso(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/** Parseur par règles (défaut). */
export class RuleBasedScenarioParser implements ScenarioParser {
  parse(text: string): ParsedScenario {
    const patch: Partial<SimulationInput> = {};
    const understood: string[] = [];

    const crypto = detectCrypto(text);
    if (crypto) {
      patch.crypto = crypto.id;
      understood.push(crypto.label);
    }

    const amount = detectAmount(text);
    if (amount != null) {
      patch.amount = amount;
      understood.push(`${amount} €`);
    }

    const frequency = detectFrequency(text);
    if (frequency) {
      patch.frequency = frequency.value;
      understood.push(frequency.label);
    }

    // Dates : années + mois éventuel + intentions « depuis / jusqu'à / en ».
    const years = (text.match(YEAR_RE) ?? []).map((y) => Number.parseInt(y, 10));
    const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
    const month = detectMonth(text);
    const hasDepuis = /(depuis|à partir|a partir|d[èe]s)\b/i.test(text);
    const singleEn = /\ben\b/i.test(text);

    if (uniqueYears.length >= 2) {
      const start = iso(uniqueYears[0], month ?? 1);
      const end = iso(uniqueYears[uniqueYears.length - 1], 12);
      patch.startDate = start;
      patch.endDate = end;
      understood.push(`${uniqueYears[0]} → ${uniqueYears[uniqueYears.length - 1]}`);
    } else if (uniqueYears.length === 1) {
      const y = uniqueYears[0];
      const m = month ?? 1;
      if (singleEn && !hasDepuis) {
        // « en 2021 » → toute l'année.
        patch.startDate = iso(y, 1);
        patch.endDate = iso(y, 12);
        understood.push(`en ${y}`);
      } else {
        patch.startDate = iso(y, m);
        understood.push(
          month ? `depuis ${MONTH_LABELS[m]} ${y}` : `depuis ${y}`,
        );
      }
    }

    return { patch, understood };
  }
}

export const defaultScenarioParser: ScenarioParser = new RuleBasedScenarioParser();

/** Helper direct. */
export function parseScenario(text: string): ParsedScenario {
  return defaultScenarioParser.parse(text);
}
