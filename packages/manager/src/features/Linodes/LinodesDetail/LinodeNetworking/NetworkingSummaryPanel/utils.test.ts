import { calculatePercentageWithCeiling } from './utils';

describe('calculatePercentageWithCeiling', () => {
  it('should calculate the percentage when target is greater than value', () => {
    const value = 25;
    const target = 50;
    const result = calculatePercentageWithCeiling(value, target);
    expect(result).toBe(50);
  });

  it('should return 100 when target is less than or equal to value', () => {
    const value1 = 75;
    const target1 = 50;
    const result1 = calculatePercentageWithCeiling(value1, target1);
    expect(result1).toBe(100);

    const value2 = 50;
    const target2 = 50;
    const result2 = calculatePercentageWithCeiling(value2, target2);
    expect(result2).toBe(100);
  });
});
