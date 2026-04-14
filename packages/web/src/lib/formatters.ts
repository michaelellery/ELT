/**
 * Formatters — currency, percentage, and number utilities
 */

/**
 * Format a number as USD currency
 * @example formatCurrency(1234.5) → "$1,234.50"
 */
export function formatCurrency(value: number, opts?: { decimals?: number }): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts?.decimals ?? 2,
    maximumFractionDigits: opts?.decimals ?? 2,
  }).format(value);
}

/**
 * Format a number as a percentage string
 * @example formatPercent(35.99) → "35.99%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Round to 2 decimal places
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format a compact number (e.g. 1500 → "$1.5K")
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a credit score as a string with rating label
 */
export function formatCreditScore(score: number): { score: string; label: string; color: string } {
  let label: string;
  let color: string;

  if (score >= 800) {
    label = "Exceptional";
    color = "#059669";
  } else if (score >= 740) {
    label = "Very Good";
    color = "#10b981";
  } else if (score >= 670) {
    label = "Good";
    color = "#f59e0b";
  } else if (score >= 580) {
    label = "Fair";
    color = "#d97706";
  } else {
    label = "Poor";
    color = "#dc2626";
  }

  return { score: score.toString(), label, color };
}

/**
 * Format relative time
 * @example formatTime(new Date()) → "just now"
 */
export function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return "just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} min ago`;

  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Format a number with commas
 * @example formatNumber(15000) → "15,000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
