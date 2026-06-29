import { UNKNOWN_PRICE } from '@akamai/compute-ui-core/api';

import {
  formatPrice,
  getAdaptiveDecimalPlacesCount,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type { PriceObject } from '@linode/api-v4';

describe('priceInterval utilities', () => {
  describe('getLabelForInterval', () => {
    it('returns correct label for hourly', () => {
      expect(getLabelForInterval('hourly')).toBe('hour');
    });
    it('returns correct label for monthly', () => {
      expect(getLabelForInterval('monthly')).toBe('month');
    });
  });

  describe('getPriceForInterval', () => {
    const priceObj = { hourly: 0.015, monthly: 10 };
    it('returns correct price for interval', () => {
      expect(getPriceForInterval(priceObj, 'hourly')).toBe(0.015);
      expect(getPriceForInterval(priceObj, 'monthly')).toBe(10);
    });
    it('falls back to monthly if interval missing', () => {
      expect(
        getPriceForInterval(priceObj, 'unknown' as keyof PriceObject)
      ).toBe(10);
    });
    it('returns undefined if price is null/undefined', () => {
      expect(getPriceForInterval(null, 'hourly')).toBeUndefined();
      expect(getPriceForInterval(undefined, 'monthly')).toBeUndefined();
    });
  });

  describe('getAdaptiveDecimalPlacesCount', () => {
    it('returns 0 for integers', () => {
      expect(getAdaptiveDecimalPlacesCount(0)).toBe(0);
      expect(getAdaptiveDecimalPlacesCount(5)).toBe(0);
      expect(getAdaptiveDecimalPlacesCount(10)).toBe(0);
      expect(getAdaptiveDecimalPlacesCount(5.0)).toBe(0);
      expect(getAdaptiveDecimalPlacesCount(10.0)).toBe(0);
    });

    it('returns 2 for values that only need 1 significant decimal', () => {
      expect(getAdaptiveDecimalPlacesCount(0.1)).toBe(2);
      expect(getAdaptiveDecimalPlacesCount(10.5)).toBe(2);
    });

    it('returns actual decimal count for higher-precision values', () => {
      expect(getAdaptiveDecimalPlacesCount(0.015)).toBe(3);
      expect(getAdaptiveDecimalPlacesCount(0.0075)).toBe(4);
      expect(getAdaptiveDecimalPlacesCount(0.00369)).toBe(5);
      expect(getAdaptiveDecimalPlacesCount(1.0191)).toBe(4);
      expect(getAdaptiveDecimalPlacesCount(10.555)).toBe(3);
    });

    it('strips floating point noise before counting decimals', () => {
      // 0.2 * 3 = 0.6000000000000001, which cleans to 0.6 - treated as minimum 2 decimal places
      expect(getAdaptiveDecimalPlacesCount(0.2 * 3)).toBe(2);
      expect(getAdaptiveDecimalPlacesCount(0.6000000000000001)).toBe(2);
      // 0.1 + 0.2 = 0.30000000000000004, which cleans to 0.3 - treated as minimum 2 decimal places
      expect(getAdaptiveDecimalPlacesCount(0.1 + 0.2)).toBe(2);
      expect(getAdaptiveDecimalPlacesCount(0.30000000000000004)).toBe(2);
      // 1.005 * 100 / 100 = 1.0049999999999999, which cleans to 1.005 - treated as 3 decimal places
      expect(getAdaptiveDecimalPlacesCount((1.005 * 100) / 100)).toBe(3);
      expect(getAdaptiveDecimalPlacesCount(1.0049999999999999)).toBe(3);
      // 0.1 * 0.1 = 0.010000000000000002, which cleans to 0.01 - treated as minimum 2 decimal places
      expect(getAdaptiveDecimalPlacesCount(0.1 * 0.1)).toBe(2);
      expect(getAdaptiveDecimalPlacesCount(0.010000000000000002)).toBe(2);
    });
  });

  describe('formatPrice', () => {
    it('formats price with natural decimal precision', () => {
      expect(formatPrice(0.0075)).toBe('0.0075');
      expect(formatPrice(0.015)).toBe('0.015');
      expect(formatPrice(1.0191)).toBe('1.0191');
      expect(formatPrice(0.1)).toBe('0.10');
      expect(formatPrice(5.0)).toBe('5');
      expect(formatPrice(10)).toBe('10');
      expect(formatPrice(10.0)).toBe('10');
      expect(formatPrice(10.5)).toBe('10.50');
      expect(formatPrice(10.555)).toBe('10.555');
      expect(formatPrice(0.00369)).toBe('0.00369');
      expect(formatPrice(0.2 * 3)).toBe('0.60');
      expect(formatPrice(0.6000000000000001)).toBe('0.60');
    });
    it('returns UNKNOWN_PRICE for null/undefined', () => {
      expect(formatPrice(null)).toBe(UNKNOWN_PRICE);
      expect(formatPrice(undefined)).toBe(UNKNOWN_PRICE);
    });
  });
});
