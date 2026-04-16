import { UNKNOWN_PRICE } from './constants';

import type { PriceObject } from '@linode/api-v4';

/**
 * Returns the price value for the given interval from a PriceObject.
 *
 * Falls back to `price.monthly` if the interval key doesn't exist yet on the
 * API response — this can happen when the LD flag is rolled out before the API
 * ships the new field.
 *
 * @example
 * getPriceForInterval(price, 'hourly'); // price.hourly
 */
export const getPriceForInterval = (
  price: null | PriceObject | undefined,
  interval: keyof PriceObject
): null | number | undefined => {
  if (!price) {
    return undefined;
  }
  return interval in price ? price[interval] : price.monthly;
};

/**
 * Returns the display label for a given interval by dropping the trailing 'ly'.
 * e.g. `'hourly'` -> `'hour'`, `'monthly'` -> `'month'`.
 * Any future interval ending in 'ly' (e.g. `'minutely'`) will work automatically.
 */
export const getLabelForInterval = (interval: keyof PriceObject): string =>
  interval.slice(0, -2);

/**
 * Formats a price for display at the correct decimal places for the given
 * interval. Returns `UNKNOWN_PRICE` if the value is null or undefined.
 * Always applies fixed decimal places: 2 for monthly, 3 for hourly.
 */
export const formatPriceForInterval = (
  value: null | number | undefined,
  interval: keyof PriceObject
): string => {
  if (value === null || value === undefined) {
    return UNKNOWN_PRICE;
  }
  return interval === 'hourly' ? value.toFixed(3) : value.toFixed(2);
};
