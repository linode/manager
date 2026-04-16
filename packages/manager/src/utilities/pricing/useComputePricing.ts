import { useFlags } from 'src/hooks/useFlags';

import { UNKNOWN_PRICE } from './constants';
import {
  formatPriceForInterval,
  getDecimalPlaces,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type { PriceObject } from '@linode/api-v4';

/**
 * Returns pricing helpers bound to the active billing interval from the `computePricing` LD flag.
 *
 * @example
 * const { decimalPlaces, getPrice, priceLabel } = useComputePricing();
 * <Currency decimalPlaces={decimalPlaces} quantity={getPrice(type.addons.backups.price)} />
 * {`/${priceLabel}`}
 *
 * @example
 * <DisplayPrice decimalPlaces={decimalPlaces} interval={priceLabel} price={getPrice(price)} />
 */
export const useComputePricing = () => {
  const { computePricing } = useFlags();
  // Active billing mode from the `computePricing` LD flag.
  const billing: keyof PriceObject = computePricing?.billing ?? 'monthly';

  return {
    /** Active billing mode from the LD flag (e.g. `'monthly'`, `'hourly'`). */
    billing,
    /**
     * Decimal places for the active billing interval (2 for monthly, 3 for hourly).
     * Pass this to `<Currency>` or `<DisplayPrice>` to get correct formatting.
     */
    decimalPlaces: getDecimalPlaces(billing),
    /** Decimal places for monthly prices. Always 2. */
    monthlyDecimalPlaces: getDecimalPlaces('monthly'),
    /** Decimal places for hourly prices. Always 3. */
    hourlyDecimalPlaces: getDecimalPlaces('hourly'),
    /**
     * Returns the price value for the active billing interval from a PriceObject,
     * or `UNKNOWN_PRICE` (`'--.--'`) if the price is unavailable.
     *
     * Use with `<Currency>` or `<DisplayPrice>` — avoid template literals
     * since raw numbers won't include trailing zeros (e.g. `5.5` vs `5.50`).
     */
    getPrice: (
      priceObject: null | PriceObject | undefined
    ): '--.--' | number => {
      const value = getPriceForInterval(priceObject, billing);
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
      const value = getPriceForInterval(priceObject, billing);
      return formatPriceForInterval(value, billing);
    },
    /** Short label for the active billing interval (eg., `'hour'`, `'month'`, etc). */
    priceLabel: getLabelForInterval(billing),
  };
};
