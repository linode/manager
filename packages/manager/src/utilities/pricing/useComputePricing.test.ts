import { renderHook } from '@testing-library/react';

import { wrapWithTheme } from '../testHelpers';
import { useComputePricing } from './useComputePricing';

import type { PriceObject } from '@linode/api-v4';

describe('useComputePricing', () => {
  (['monthly', 'hourly'] as const).forEach((billing) => {
    describe(`when billing is '${billing}'`, () => {
      const price: PriceObject = { hourly: 0.015, monthly: 10 };
      const options = { flags: { computePricing: { billing, banner: '' } } };

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
    });
  });
});
