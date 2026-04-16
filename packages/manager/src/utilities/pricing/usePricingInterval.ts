import { useFlags } from 'src/hooks/useFlags';

import { UNKNOWN_PRICE } from './constants';
import {
  formatPriceForInterval,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type { PriceObject } from '@linode/api-v4';

/**
 * Returns pricing helpers bound to the active billing interval from the `computePricing` LD flag.
 *
 * @example
 * const { decimalPlaces, getPrice, priceLabel } = usePricingInterval();
 * <Currency decimalPlaces={decimalPlaces} quantity={getPrice(type.addons.backups.price)} />
 * {`/${priceLabel}`}
 *
 * @example
 * <DisplayPrice decimalPlaces={decimalPlaces} interval={priceLabel} price={getPrice(price)} />
 */
export const usePricingInterval = () => {
  const { computePricing } = useFlags();
  const interval: keyof PriceObject = computePricing?.interval ?? 'monthly';

  return {
    /** The active billing interval (eg., `'monthly'`, `'hourly'`, etc). */
    interval,
    /**
     * Decimal places for the active interval (2 for monthly, 3 for hourly).
     * Pass this to `<Currency>` or `<DisplayPrice>` to get correct formatting.
     */
    decimalPlaces: interval === 'hourly' ? 3 : 2,
    /**
     * Returns the price value for the active interval from a PriceObject,
     * or `UNKNOWN_PRICE` (`'--.--'`) if the price is unavailable.
     *
     * Use with `<Currency>` or `<DisplayPrice>` — avoid template literals
     * since raw numbers won't include trailing zeros (e.g. `5.5` vs `5.50`).
     */
    getPrice: (
      priceObject: null | PriceObject | undefined
    ): '--.--' | number => {
      const value = getPriceForInterval(priceObject, interval);
      if (value === null || value === undefined) {
        return UNKNOWN_PRICE;
      }
      return value;
    },
    /**
     * Same as `getPrice` but returns a formatted string with the correct
     * decimal places. Use this in string-only contexts where `<Currency>`
     * or `<DisplayPrice>` can't be used (e.g. `subHeadings`, `aria-label`).
     */
    formatPrice: (priceObject: null | PriceObject | undefined): string => {
      const value = getPriceForInterval(priceObject, interval);
      return formatPriceForInterval(value, interval);
    },
    /** Short label for the active interval (eg., `'hour'`, `'month'`, etc). */
    priceLabel: getLabelForInterval(interval),
  };
};
