import { calculatePercentageWithCeiling } from './NetworkTransfer';

describe('calculatePercentage', () => {
  it('returns the correct percentage of a value in relation to a target', () => {
    expect(calculatePercentageWithCeiling(50, 100)).toBe(50);
    expect(calculatePercentageWithCeiling(50, 200)).toBe(25);
    expect(calculatePercentageWithCeiling(50, 50)).toBe(100);
  });
  it('caps the percentage at 100', () => {
    expect(calculatePercentageWithCeiling(101, 100)).toBe(100);
  });
});
