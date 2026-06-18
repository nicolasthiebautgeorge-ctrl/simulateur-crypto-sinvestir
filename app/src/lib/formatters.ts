/** Formatage localisé (fr-FR) pour l'affichage. */

const FR = "fr-FR";

export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat(FR, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Pourcentage avec signe explicite (+/-). */
export function formatPercent(value: number, fractionDigits = 1): string {
  const formatted = new Intl.NumberFormat(FR, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    signDisplay: "exceptZero",
  }).format(value);
  return `${formatted} %`;
}

/** Signe explicite sur un montant en devise (pour les +/- values). */
export function formatSignedCurrency(value: number, currency = "EUR"): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatCurrency(Math.abs(value), currency)}`;
}

/** Quantité de crypto (jusqu'à 6 décimales significatives). */
export function formatQuantity(value: number): string {
  return new Intl.NumberFormat(FR, {
    maximumFractionDigits: 6,
  }).format(value);
}

export function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat(FR, {
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}
