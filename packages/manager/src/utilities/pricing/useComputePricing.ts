import { useMemo } from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { UNKNOWN_PRICE } from './constants';
import {
  formatPrice,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type { PriceObject } from '@linode/api-v4';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

/**
 * Returns pricing helpers bound to the active billing interval from the `computePricing` LD flag.
 *
 * Pass `planTypeId` when rendering a specific plan - if `activeBillingPlanMatchers` is set
 * in the flag, the active billing mode only applies to matching plans and everything else
 * falls back to `'monthly'`. Omit `planTypeId` in places not tied to a specific plan.
 *
 * @example
 * const { getPrice, priceLabel, billing } = useComputePricing(plan.id);
 *
 * @example
 * const { getPrice, priceLabel, billing } = useComputePricing();
 */
export const useComputePricing = (planTypeId?: null | string) => {
  const { computePricing } = useFlags();

  const baseBilling: keyof PriceObject = computePricing?.billing ?? 'monthly';

  const billing: keyof PriceObject = useMemo(() => {
    // Only relevant when billing is non-monthly - monthly is the universal fallback
    // for all plans regardless, so scoping it makes no difference.
    // `computePricing` may be undefined when the flag is off entirely; fall back to [].
    const activeBillingPlanMatchers: string[] =
      computePricing?.activeBillingPlanMatchers ?? [];

    if (!planTypeId || baseBilling === 'monthly') {
      return baseBilling;
    }

    if (activeBillingPlanMatchers.length === 0) {
      return baseBilling;
    }

    const isEligibleForActiveBilling = activeBillingPlanMatchers.some(
      (matcher) => planTypeId.toLowerCase().includes(matcher.toLowerCase())
    );

    return isEligibleForActiveBilling ? baseBilling : 'monthly';
  }, [computePricing, baseBilling, planTypeId]);

  return {
    /** Active billing mode (e.g. `'monthly'`, `'hourly'`). Scoped to the plan when `planTypeId` is provided. */
    billing,
    /**
     * Returns true if any plan in the list is billed hourly (i.e. would show "N/A"
     * in the Monthly column). Pass the full tab plan list (not paginated/filtered) -
     * so the result stays consistent across page and filter changes.
     *
     * It always checks against the base billing mode and it's not affected by `planTypeId` even ifprovided.
     */
    hasHourlyEligiblePlans: (planList: PlanWithAvailability[]): boolean => {
      if (baseBilling !== 'hourly') {
        return false;
      }
      const matchers: string[] =
        computePricing?.activeBillingPlanMatchers ?? [];
      if (matchers.length === 0) {
        // No matchers - every plan uses hourly billing.
        return planList.length > 0;
      }
      return planList.some((plan) =>
        matchers.some((matcher) =>
          plan.id.toLowerCase().includes(matcher.toLowerCase())
        )
      );
    },
    /**
     * Returns the price value for the active billing interval from a PriceObject,
     * or `UNKNOWN_PRICE` (`'--.--'`) if the price is unavailable.
     *
     * Use with `<Currency>` or `<DisplayPrice>` — avoid template literals
     * since raw numbers won't include trailing zeros (e.g. `5.5` vs `5.50`).
     */
    getPrice: (
      priceObject: null | PriceObject | undefined
    ): number | typeof UNKNOWN_PRICE => {
      const value = getPriceForInterval(priceObject, billing);
      if (value === null || value === undefined) {
        return UNKNOWN_PRICE;
      }
      return value;
    },
    /**
     * Same as `getPrice` but returns a formatted string with the correct
     * decimal places for the active billing interval.
     * Use this in string-only contexts where `<Currency>` or `<DisplayPrice>`
     * can't be used (e.g. `subHeadings`, `aria-label`).
     */
    formatPrice: (priceObject: null | PriceObject | undefined): string => {
      const value = getPriceForInterval(priceObject, billing);
      return formatPrice(value);
    },
    /**
     * Label for the active billing mode (e.g. `'hour'`, `'month'`).
     * Pass `'short'` to `getLabelForInterval` directly if an abbreviated form is needed.
     */
    priceLabel: getLabelForInterval(billing),
  };
};
