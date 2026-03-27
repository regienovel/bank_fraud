// Formatting utilities for Ghana-specific display

/**
 * Format a number as Ghanaian Cedi currency string.
 * Example: 1234.56 -> "GH₵ 1,234.56"
 */
export function formatCurrency(amount: number): string {
  const formatted = amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `GH\u20B5 ${formatted}`;
}

/**
 * Format a Date for Ghana timezone display (GMT).
 * Example: "27 Mar 2026, 11:23:47 AM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Africa/Accra',
  });
}

/**
 * Format a number with thousands separators.
 * Example: 1247 -> "1,247"
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/**
 * Format a number as a percentage string.
 * Example: 97.3 -> "97.3%"
 */
export function formatPercentage(n: number): string {
  return `${n.toFixed(1)}%`;
}
