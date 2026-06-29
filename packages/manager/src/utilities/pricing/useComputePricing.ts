import { UNKNOWN_PRICE } from '@akamai/compute-ui-core/api';
import { useMemo } from 'react';

import { useFlags } from 'src/hooks/useFlags';

import {
  formatPrice,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type { PriceObject } from '@linode/api-v4';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

/**
 * Pure helper - resolves the active billing mode for a given plan type ID.
 * Monthly is the universal fallback for all plans, so scoping matchers only
 * matters when `baseBilling` is non-monthly.
 */
const resolveBillingForPlanType = (
  typeId: null | string | undefined,
  baseBilling: keyof PriceObject,
  matchers: string[]
): keyof PriceObject => {
  if (!typeId || baseBilling === 'monthly') {
    return baseBilling;
  }
  if (matchers.length === 0) {
    return baseBilling;
  }
  return matchers.some((m) => typeId.toLowerCase().includes(m.toLowerCase()))
    ? baseBilling
    : 'monthly';
};

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
    const matchers: string[] = computePricing?.activeBillingPlanMatchers ?? [];
    return resolveBillingForPlanType(planTypeId, baseBilling, matchers);
  }, [computePricing, baseBilling, planTypeId]);

  return {
    /** Active billing mode (e.g. `'monthly'`, `'hourly'`). Scoped to the plan when `planTypeId` is provided. */
    billing,
    /**
     * Returns true if any plan in the list is billed hourly (i.e. would show "N/A"
     * in the Monthly column). Pass the full tab plan list (not paginated/filtered) -
     * so the result stays consistent across page and filter changes.
     *
     * It always checks against the base billing mode and it's not affected by `planTypeId` even if provided.
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
     * Returns the formatted price subheading shown on a plan or node row for the active billing mode.
     *
     * - On monthly billing it shows the monthly price with the hourly price in parentheses.
     * - On hourly billing it shows just the hourly price. Those plans have no monthly commitment,
     * so we hide the monthly value even when the API happens to return a monthly value.
     *
     * @param options.format - Pass `format: 'short'` for tight spaces like table rows to get
     * abbreviated price labels (`mo`/`hr`) instead of the default long-form labels (`month`/`hour`).
     *
     * @param options.missingPriceFallback - Pass `missingPriceFallback: 'zero'` to show `$0` for missing prices
     * (e.g. before a plan is picked) instead of the default unknown-price placeholder `$--.--`.
     *
     * @example
     * 1. Monthly billing (default)
     *    a. getPriceSubheading({ hourly: 0.09, monthly: 60 })
     *    // '$60/month ($0.09/hour)'
     *    b. getPriceSubheading({ hourly: 0.09, monthly: 60 }, { format: 'short' })
     *    // '$60/mo ($0.09/hr)'
     *    c. getPriceSubheading(undefined)
     *    // '$--.--/month ($--.--/hour)'
     *    d. getPriceSubheading(undefined, { format: 'short', missingPriceFallback: 'zero' })
     *    // '$0/mo ($0/hr)'
     *
     * 2. Hourly billing
     *    a. getPriceSubheading({ hourly: 0.09, monthly: 60 })
     *    // '$0.09/hour'
     *    b. getPriceSubheading({ hourly: 0.09, monthly: 60 }, { format: 'short' })
     *    // '$0.09/hr'
     *    c. getPriceSubheading(undefined)
     *    // '$--.--/hour'
     *    d. getPriceSubheading(undefined, { format: 'short', missingPriceFallback: 'zero' })
     *    // '$0/hr'
     */
    getPriceSubheading: (
      priceObject: null | PriceObject | undefined,
      options: {
        format?: 'long' | 'short';
        missingPriceFallback?: 'unknown' | 'zero';
      } = {}
    ): string => {
      const { format = 'long', missingPriceFallback = 'unknown' } = options;

      const formatValue = (value: null | number | undefined): string => {
        if (value === null || value === undefined) {
          return missingPriceFallback === 'zero' ? '0' : UNKNOWN_PRICE;
        }
        return formatPrice(value);
      };

      const monthlyLabel = getLabelForInterval('monthly', format);
      const hourlyLabel = getLabelForInterval('hourly', format);
      const formattedHourly = `$${formatValue(priceObject?.hourly)}/${hourlyLabel}`;
      const formattedMonthly = `$${formatValue(priceObject?.monthly)}/${monthlyLabel}`;

      if (billing === 'hourly') {
        // Hourly-scoped plans are billed purely by the hour and have no monthly commitment,
        // so the subheading always shows only the hourly price - even when the API happens to return a monthly value.
        return formattedHourly;
      }

      if (billing === 'monthly') {
        return `${formattedMonthly} (${formattedHourly})`;
      }

      return '';
    },
    /**
     * Label for the active billing mode (e.g. `'hour'`, `'month'`).
     * Pass `'short'` to `getLabelForInterval` directly if an abbreviated form is needed.
     */
    priceLabel: getLabelForInterval(billing),
    /**
     * Returns the active billing mode for a given plan type ID.
     * Use this to determine per-pool billing in utility functions that can't call hooks.
     *
     * NOTE: This is independent of the `planTypeId` passed to `useComputePricing`.
     * The hook-level `planTypeId` only affects UI-scoped billing state (`billing`),
     * while this function always resolves billing based on the provided `typeId`.
     *
     * @example
     * const { getBillingForPlanType } = useComputePricing();
     * getTotalClusterPrice({ getBillingForPlanType, ... });
     */
    getBillingForPlanType: (typeId: string): keyof PriceObject => {
      const matchers: string[] =
        computePricing?.activeBillingPlanMatchers ?? [];
      return resolveBillingForPlanType(typeId, baseBilling, matchers);
    },
  };
};
