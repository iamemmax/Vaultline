import { format, formatDistanceToNow, isAfter, subDays } from "date-fns";

/**
 * Format a number as currency using the user's locale.
 * Defaults to USD; pass a 3-letter ISO 4217 code to override.
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  opts: { compact?: boolean } = {},
) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: opts.compact ? 2 : 2,
  }).format(amount);
}

/** Plain number formatting with grouped thousands. */
export function formatNumber(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Crypto amounts need more precision than fiat. */
export function formatCrypto(amount: number, symbol: string) {
  const decimals = symbol === "BTC" || symbol === "ETH" ? 6 : 4;
  return `${formatNumber(amount, decimals)} ${symbol}`;
}

/**
 * Smart date: relative under 7 days, absolute otherwise.
 * Banking convention — "2 hours ago" is human; "Jan 4, 2025" beyond a week.
 */
export function formatSmartDate(iso: string) {
  const date = new Date(iso);
  const sevenDaysAgo = subDays(new Date(), 7);
  if (isAfter(date, sevenDaysAgo)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM d, yyyy");
}

export function formatDate(iso: string, fmt = "MMM d, yyyy") {
  return format(new Date(iso), fmt);
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "MMM d, yyyy 'at' h:mm a");
}

/**
 * Mask sensitive numeric strings (account numbers, card numbers).
 * "1234567890" → "•••• •••• 7890"
 */
export function maskAccountNumber(value: string) {
  if (value.length <= 4) return value;
  const last4 = value.slice(-4);
  return `•••• •••• ${last4}`;
}

/** Mask a balance for the "hide eye" toggle. */
export function maskBalance(formatted: string) {
  return formatted?.replace(/[0-9]/g, "•");
}

/** Truncate a long string like a wallet address. */
export function truncateMiddle(value: string, head = 6, tail = 4) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Status badge label (sentence-cased from SCREAMING_SNAKE). */
export function humanStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}
