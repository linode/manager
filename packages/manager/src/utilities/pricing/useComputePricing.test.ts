import { renderHook } from '@testing-library/react';

import { wrapWithTheme } from '../testHelpers';
import { useComputePricing } from './useComputePricing';

import type { PriceObject } from '@linode/api-v4';
import type { PlanWithAvailability } from 'src/features/components/PlansPanel/types';

const GPU_PLAN_ID = 'g2-gpu-rtx4000a4-s';
const G6_NANODE_PLAN_ID = 'g6-nanode-1';
const G6_DEDICATED_PLAN_ID = 'g6-dedicated-16';
const G8_DEDICATED_PLAN_ID = 'g8-dedicated-16';

const mockFlagOptions = (
  billing: keyof PriceObject,
  activeBillingPlanMatchers: string[] = []
) => ({
  flags: {
    computePricing: {
      billing,
      activeBillingPlanMatchers,
      banner: { learnMoreLink: '', text: '' },
    },
  },
});

describe('useComputePricing', () => {
  describe.each(['monthly', 'hourly'] as const)(
    `when billing is '%s'`,
    (billing) => {
      const price: PriceObject = { hourly: 0.015, monthly: 10 };
      const options = mockFlagOptions(billing);

      it('returns correct billing', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(result.current.billing).toBe(billing);
      });

      it('getPrice returns correct value or UNKNOWN_PRICE', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(result.current.getPrice(price)).toBe(price[billing]);
        expect(result.current.getPrice(null)).toBe('--.--');
        expect(result.current.getPrice(undefined)).toBe('--.--');
      });

      it('formatPrice returns formatted string', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(typeof result.current.formatPrice(price)).toBe('string');
      });

      it('priceLabel returns correct label', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(['hour', 'month']).toContain(result.current.priceLabel);
      });
    }
  );

  describe('planTypeId scoping via activeBillingPlanMatchers', () => {
    it('falls back to monthly when the computePricing flag is off (undefined)', () => {
      // Flag not set at all - baseBilling defaults to 'monthly'.
      const { result } = renderHook(() => useComputePricing(GPU_PLAN_ID), {
        wrapper: (ui) => wrapWithTheme(ui, { flags: {} }),
      });
      expect(result.current.billing).toBe('monthly');
    });

    it('returns baseBilling for all plans when activeBillingPlanMatchers is empty', () => {
      // No matchers configured - every plan gets baseBilling regardless of its id.
      const { result } = renderHook(() => useComputePricing(GPU_PLAN_ID), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly')),
      });
      expect(result.current.billing).toBe('hourly');
    });

    it("returns baseBilling ('hourly') when planTypeId matches a matcher", () => {
      // The plan id contains 'gpu' which matches the configured matcher.
      const { result } = renderHook(() => useComputePricing(GPU_PLAN_ID), {
        wrapper: (ui) =>
          wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu', 'g8'])),
      });
      expect(result.current.billing).toBe('hourly');
    });

    it("falls back to 'monthly' when planTypeId does not match any matcher", () => {
      // G6_DEDICATED_PLAN_ID does not contain 'gpu' or 'g8',
      // so it falls back to monthly even though baseBilling is 'hourly'.
      const { result } = renderHook(
        () => useComputePricing(G6_DEDICATED_PLAN_ID),
        {
          wrapper: (ui) =>
            wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu', 'g8'])),
        }
      );
      expect(result.current.billing).toBe('monthly');
    });

    it("always returns 'monthly' for all plans when baseBilling is 'monthly', even if matchers are set", () => {
      // Scoping only has meaningful effect when baseBilling is non-monthly.
      // When baseBilling is 'monthly', every plan stays on monthly regardless.
      const opts = mockFlagOptions('monthly', ['gpu', 'g8']);
      const { result: matchingResult } = renderHook(
        () => useComputePricing(GPU_PLAN_ID),
        { wrapper: (ui) => wrapWithTheme(ui, opts) }
      );
      const { result: nonMatchingResult } = renderHook(
        () => useComputePricing(G6_DEDICATED_PLAN_ID),
        { wrapper: (ui) => wrapWithTheme(ui, opts) }
      );
      expect(matchingResult.current.billing).toBe('monthly');
      expect(nonMatchingResult.current.billing).toBe('monthly');
    });

    it('matcher comparison is case-insensitive', () => {
      // Matchers should match regardless of casing in either the plan id or the matcher string.
      const { result } = renderHook(() => useComputePricing(GPU_PLAN_ID), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', ['GPU'])),
      });
      expect(result.current.billing).toBe('hourly');
    });

    it('returns baseBilling when planTypeId is null (treated as no planTypeId)', () => {
      // null planTypeId is the same as omitting it - no scoping, baseBilling applies.
      const { result } = renderHook(() => useComputePricing(null), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu'])),
      });
      expect(result.current.billing).toBe('hourly');
    });
  });

  describe('hasHourlyEligiblePlans', () => {
    const GPU_PLAN = { id: GPU_PLAN_ID } as PlanWithAvailability;
    const G6_NANODE_PLAN = { id: G6_NANODE_PLAN_ID } as PlanWithAvailability;
    const G6_DEDICATED_PLAN = {
      id: G6_DEDICATED_PLAN_ID,
    } as PlanWithAvailability;
    const G8_DEDICATED_PLAN = {
      id: G8_DEDICATED_PLAN_ID,
    } as PlanWithAvailability;

    it('returns false when billing is monthly, regardless of plans or matchers', () => {
      // Even plans that match the matchers return false when baseBilling is monthly.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) =>
          wrapWithTheme(ui, mockFlagOptions('monthly', ['gpu', 'g8'])),
      });
      expect(result.current.hasHourlyEligiblePlans([GPU_PLAN])).toBe(false);
    });

    it('returns true for any plan when billing is hourly and no matchers are set', () => {
      // No matchers means all plans are hourly billed.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly')),
      });
      expect(
        result.current.hasHourlyEligiblePlans([
          G6_NANODE_PLAN,
          G6_DEDICATED_PLAN,
        ])
      ).toBe(true);
    });

    it('returns true when at least one plan in the list matches a matcher', () => {
      // Mixed list: one matching plan is enough.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) =>
          wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu', 'g8'])),
      });
      expect(
        result.current.hasHourlyEligiblePlans([G6_NANODE_PLAN, GPU_PLAN])
      ).toBe(true);
    });

    it('returns false when no plans in the list match any matcher', () => {
      // G6 dedicated and nanode plan ids contain neither 'gpu' nor 'g8'.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) =>
          wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu', 'g8'])),
      });
      expect(
        result.current.hasHourlyEligiblePlans([
          G6_NANODE_PLAN,
          G6_DEDICATED_PLAN,
        ])
      ).toBe(false);
    });

    it('returns true for a G8 dedicated plan when g8 is a matcher', () => {
      // Only G8 dedicated plans match the 'g8' matcher.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', ['g8'])),
      });
      expect(result.current.hasHourlyEligiblePlans([G8_DEDICATED_PLAN])).toBe(
        true
      );
      expect(result.current.hasHourlyEligiblePlans([G6_DEDICATED_PLAN])).toBe(
        false
      );
    });

    it('matching is case-insensitive', () => {
      // Matcher 'GPU' (uppercase) should still match plan id GPU_PLAN_ID.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', ['GPU'])),
      });
      expect(result.current.hasHourlyEligiblePlans([GPU_PLAN])).toBe(true);
    });

    it('is not affected by planTypeId', () => {
      // planTypeId scopes `billing` but hasHourlyEligiblePlans always uses baseBilling.
      // NANODE_PLAN id does not match 'gpu', so billing resolves to 'monthly' for that
      // planTypeId - but hasHourlyEligiblePlans should still return true for a matching list.
      const { result } = renderHook(
        () => useComputePricing(G6_NANODE_PLAN.id),
        {
          wrapper: (ui) =>
            wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu'])),
        }
      );
      expect(result.current.billing).toBe('monthly');
      expect(result.current.hasHourlyEligiblePlans([GPU_PLAN])).toBe(true);
    });

    it('returns false for an empty plan list', () => {
      // No plans to check - nothing can match.
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly')),
      });
      expect(result.current.hasHourlyEligiblePlans([])).toBe(false);
    });
  });

  describe('getPriceSubheading', () => {
    const price: PriceObject = { hourly: 0.09, monthly: 60 };

    describe("when billing is 'monthly'", () => {
      const options = mockFlagOptions('monthly');

      it('returns monthly with hourly in parentheses (long format by default)', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(result.current.getPriceSubheading(price)).toBe(
          '$60/month ($0.09/hour)'
        );
      });

      it("uses abbreviated labels when format option 'short' is provided", () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(
          result.current.getPriceSubheading(price, { format: 'short' })
        ).toBe('$60/mo ($0.09/hr)');
      });

      it('renders $--.-- for missing prices by default', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(result.current.getPriceSubheading(undefined)).toBe(
          '$--.--/month ($--.--/hour)'
        );
        expect(result.current.getPriceSubheading(null)).toBe(
          '$--.--/month ($--.--/hour)'
        );
        expect(
          result.current.getPriceSubheading({ hourly: null, monthly: null })
        ).toBe('$--.--/month ($--.--/hour)');
      });

      it("renders $0 for missing prices when missingPriceFallback option 'zero' is provided", () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(
          result.current.getPriceSubheading(undefined, {
            format: 'short',
            missingPriceFallback: 'zero',
          })
        ).toBe('$0/mo ($0/hr)');
      });
    });

    describe("when billing is 'hourly'", () => {
      const options = mockFlagOptions('hourly');

      it('returns only the hourly price (long format by default)', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(result.current.getPriceSubheading(price)).toBe('$0.09/hour');
      });

      it('hides the monthly price even if the API returns one', () => {
        // Hourly-scoped plans have no monthly commitment, so it doesn't show the monthly price.
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        const subheading = result.current.getPriceSubheading(price);
        expect(subheading).not.toContain('/month');
        expect(subheading).not.toContain('60');
      });

      it("uses abbreviated label when format option 'short' is provided", () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(
          result.current.getPriceSubheading(price, { format: 'short' })
        ).toBe('$0.09/hr');
      });

      it('renders $--.-- when hourly is missing by default', () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(
          result.current.getPriceSubheading({ hourly: null, monthly: 60 })
        ).toBe('$--.--/hour');
      });

      it("renders $0 when hourly is missing and missingPriceFallback option 'zero' is provided", () => {
        const { result } = renderHook(() => useComputePricing(), {
          wrapper: (ui) => wrapWithTheme(ui, options),
        });
        expect(
          result.current.getPriceSubheading(undefined, {
            missingPriceFallback: 'zero',
          })
        ).toBe('$0/hour');
      });
    });
  });

  describe('getBillingForPlanType', () => {
    it('applies matcher logic correctly', () => {
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) =>
          wrapWithTheme(ui, mockFlagOptions('hourly', ['g8', 'gpu'])),
      });

      // matches G8 or gpu matcher -> hourly
      expect(result.current.getBillingForPlanType(G8_DEDICATED_PLAN_ID)).toBe(
        'hourly'
      );
      expect(result.current.getBillingForPlanType(GPU_PLAN_ID)).toBe('hourly');

      // does not match -> fallback to monthly
      expect(result.current.getBillingForPlanType(G6_DEDICATED_PLAN_ID)).toBe(
        'monthly'
      );
    });

    it('returns baseBilling when matcher list is empty', () => {
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', [])),
      });

      expect(result.current.getBillingForPlanType(GPU_PLAN_ID)).toBe('hourly');
      expect(result.current.getBillingForPlanType(G6_DEDICATED_PLAN_ID)).toBe(
        'hourly'
      );
    });

    it('returns baseBilling when planTypeId is undefined', () => {
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', ['gpu'])),
      });

      expect(
        result.current.getBillingForPlanType(undefined as unknown as string)
      ).toBe('hourly');
    });

    it('returns monthly when baseBilling is monthly regardless of matcher match', () => {
      const { result } = renderHook(() => useComputePricing(), {
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('monthly', ['gpu'])),
      });

      expect(result.current.getBillingForPlanType(GPU_PLAN_ID)).toBe('monthly');
      expect(result.current.getBillingForPlanType(G6_DEDICATED_PLAN_ID)).toBe(
        'monthly'
      );
    });

    it('matches plan ids case-insensitively', () => {
      const { result } = renderHook(() => useComputePricing(), {
        // Provide GPU (uppercase) in LD flag matchers to verify case-insensitive matching
        wrapper: (ui) => wrapWithTheme(ui, mockFlagOptions('hourly', ['GPU'])),
      });

      expect(result.current.getBillingForPlanType(GPU_PLAN_ID)).toBe('hourly');
    });

    it('getBillingForPlanType is independent of hook planTypeId', () => {
      const { result } = renderHook(() => useComputePricing(GPU_PLAN_ID), {
        wrapper: (ui) =>
          wrapWithTheme(ui, mockFlagOptions('hourly', ['g8', 'gpu'])),
      });

      // Even though hook is initialized with GPU_PLAN_ID,
      // resolution must depend ONLY on function argument.
      expect(result.current.getBillingForPlanType(G6_DEDICATED_PLAN_ID)).toBe(
        'monthly'
      );
      expect(result.current.getBillingForPlanType(G8_DEDICATED_PLAN_ID)).toBe(
        'hourly'
      );
      expect(result.current.getBillingForPlanType(GPU_PLAN_ID)).toBe('hourly');
    });
  });
});
