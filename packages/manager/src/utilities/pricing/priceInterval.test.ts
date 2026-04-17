import { UNKNOWN_PRICE } from './constants';
import {
  formatPriceForInterval,
  getDecimalPlaces,
  getLabelForInterval,
  getPriceForInterval,
} from './priceInterval';

import type { PriceObject } from '@linode/api-v4';

describe('priceInterval utilities', () => {
  describe('getDecimalPlaces', () => {
    it('returns 0 for integer values', () => {
      expect(getDecimalPlaces(10.0, 'monthly')).toBe(0);
      expect(getDecimalPlaces(10, 'monthly')).toBe(0);
      expect(getDecimalPlaces(5.0, 'hourly')).toBe(0);
      expect(getDecimalPlaces(0, 'hourly')).toBe(0);
    });
    it('returns 3 for non-integer hourly', () => {
      expect(getDecimalPlaces(0.015, 'hourly')).toBe(3);
      expect(getDecimalPlaces(1.123, 'hourly')).toBe(3);
      expect(getDecimalPlaces(1.12, 'hourly')).toBe(3);
    });
    it('returns 2 for non-integer monthly', () => {
      expect(getDecimalPlaces(10.5, 'monthly')).toBe(2);
      expect(getDecimalPlaces(1.99, 'monthly')).toBe(2);
    });
    it('returns 0 if value is not a number', () => {
      expect(getDecimalPlaces(undefined, 'monthly')).toBe(0);
      expect(getDecimalPlaces(null, 'hourly')).toBe(0);
      expect(getDecimalPlaces(UNKNOWN_PRICE, 'hourly')).toBe(0);
    });
  });

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

  describe('formatPriceForInterval', () => {
    it('formats price with correct decimals', () => {
      expect(formatPriceForInterval(0.015, 'hourly')).toBe('0.015');
      expect(formatPriceForInterval(1.0191, 'hourly')).toBe('1.019');
      expect(formatPriceForInterval(5.0, 'hourly')).toBe('5');
      expect(formatPriceForInterval(10.0, 'monthly')).toBe('10');
      expect(formatPriceForInterval(10.5, 'monthly')).toBe('10.50');
      expect(formatPriceForInterval(10.555, 'monthly')).toBe('10.55');
    });
    it('returns UNKNOWN_PRICE for null/undefined', () => {
      expect(formatPriceForInterval(null, 'hourly')).toBe(UNKNOWN_PRICE);
      expect(formatPriceForInterval(undefined, 'monthly')).toBe(UNKNOWN_PRICE);
    });
  });
});
