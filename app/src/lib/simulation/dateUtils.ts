import type { Frequency } from "@/lib/simulation/types";

/** Toutes les dates sont manipulées en UTC pour éviter les décalages de fuseau. */

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function addMonths(iso: string, months: number): string {
  const d = parseISO(iso);
  const targetMonth = d.getUTCMonth() + months;
  const target = new Date(Date.UTC(d.getUTCFullYear(), targetMonth, 1));
  // Conserver le jour du mois sans déborder (ex. 31 jan + 1 mois → 28/29 fév).
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(d.getUTCDate(), lastDay));
  return toISO(target);
}

export function isBeforeOrEqual(a: string, b: string): boolean {
  return parseISO(a).getTime() <= parseISO(b).getTime();
}

/**
 * Calendrier des dates d'achat entre start et end (bornes incluses) selon la fréquence.
 * `one-shot` ne renvoie que la date de début.
 */
export function buildSchedule(
  start: string,
  end: string,
  frequency: Frequency,
): string[] {
  if (!isBeforeOrEqual(start, end)) return [];
  if (frequency === "one-shot") return [start];

  const step = (iso: string): string => {
    switch (frequency) {
      case "daily":
        return addDays(iso, 1);
      case "weekly":
        return addDays(iso, 7);
      case "monthly":
        return addMonths(iso, 1);
    }
  };

  const dates: string[] = [];
  let cursor = start;
  while (isBeforeOrEqual(cursor, end)) {
    dates.push(cursor);
    cursor = step(cursor);
  }
  return dates;
}

/**
 * Échantillonne ~`maxPoints` dates réparties uniformément entre start et end (bornes incluses),
 * pour tracer une courbe lisible quelle que soit la durée.
 */
export function sampleDates(
  start: string,
  end: string,
  maxPoints = 80,
): string[] {
  const startT = parseISO(start).getTime();
  const endT = parseISO(end).getTime();
  if (endT <= startT) return [start];

  const points = Math.max(2, maxPoints);
  const dates: string[] = [];
  for (let i = 0; i < points; i++) {
    const t = startT + ((endT - startT) * i) / (points - 1);
    dates.push(toISO(new Date(t)));
  }
  // Dédoublonnage (utile pour les périodes très courtes).
  return Array.from(new Set(dates));
}
