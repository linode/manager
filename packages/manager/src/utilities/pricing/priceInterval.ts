import { UNKNOWN_PRICE } from '@akamai/compute-ui-core/api';

import type { PriceObject } from '@linode/api-v4';

/**
 * Returns the price value for the given interval from a PriceObject.
 * Falls back to `price.monthly` if the API response PriceObject doesn't include the interval key yet
 * (e.g. This can happen when the LD flag is rolled out before the API ships the new field).
 *
 * Note: `interval` is always provided by the caller - it's the PriceObject key
 * that may be absent, not the interval itself.
 *
 * @example
 * getPriceForInterval(price, 'hourly'); // price.hourly ?? price.monthly
 */
export const getPriceForInterval = (
  price: null | PriceObject | undefined,
  interval: keyof PriceObject
): null | number | undefined => {
  if (!price) {
    return undefined;
  }
  return price[interval] ?? price.monthly;
};

// Short-form labels for known intervals. Any interval not listed here falls back
// to trimming the last two characters (same as the long form), so future intervals
// added to PriceObject won't break anything.
const SHORT_INTERVAL_LABELS: Partial<Record<keyof PriceObject, string>> = {
  hourly: 'hr',
  monthly: 'mo',
};

/**
 * Returns the display label for a given interval.
 * - `'long'` (default): drops the trailing 'ly' - e.g. `'hourly'` -> `'hour'`
 * - `'short'`: uses abbreviated form - e.g. `'hourly'` -> `'hr'`, `'monthly'` -> `'mo'`
 */
export const getLabelForInterval = (
  interval: keyof PriceObject,
  format: 'long' | 'short' = 'long'
): string => {
  if (format === 'short') {
    return SHORT_INTERVAL_LABELS[interval] ?? interval.slice(0, -2);
  }
  return interval.slice(0, -2);
};

/**
 * Returns the number of decimal places to display for a price value.
 * Integers return 0, non-integers return at least 2 and expand for higher
 * precision values. Floating point noise is stripped before counting.
 *
 * @example
 * getAdaptiveDecimalPlacesCount(10.0)     // 0  (eg., $10)
 * getAdaptiveDecimalPlacesCount(10.5)     // 2  (eg., $10.50)
 * getAdaptiveDecimalPlacesCount(0.0075)   // 4  (eg., $0.0075)
 * getAdaptiveDecimalPlacesCount(0.00369)  // 5  (eg., $0.00369)
 */
export const getAdaptiveDecimalPlacesCount = (value: number): number => {
  if (Number.isInteger(value)) return 0;

  // Strip floating point noise (e.g. 0.2 * 3 = 0.6000000000000001 -> 0.6)
  const clean = parseFloat(value.toFixed(10));
  const str = clean.toString();
  const dot = str.indexOf('.');
  const actual = dot === -1 ? 0 : str.length - dot - 1;
  return Math.max(2, actual);
};

/**
 * Formats a price for display. Returns `UNKNOWN_PRICE` if the value is null or undefined.
 * Uses the value's actual precision from the API — integers render without decimals,
 * non-integers use at least 2 decimal places and expand for higher precision values.
 *
 * @example
 * formatPrice(10.0)       // '10'
 * formatPrice(10.5)     // '10.50'
 * formatPrice(0.0075)   // '0.0075'
 * formatPrice(0.00369)  // '0.00369'
 * formatPrice(null)     // UNKNOWN_PRICE
 */
export const formatPrice = (value: null | number | undefined): string => {
  if (value === null || value === undefined) {
    return UNKNOWN_PRICE;
  }
  return value.toFixed(getAdaptiveDecimalPlacesCount(value));
};
