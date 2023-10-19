import { roundTo } from './roundTo';

describe('roundTo utility', () => {
  it('should round to 2 digits by default', () => {
    expect(roundTo(2.112)).toBe(2.11);
  });

  it('should not add decimals to integers', () => {
    expect(roundTo(4)).toBe(4);
  });

  it('should handle small values', () => {
    expect(roundTo(0.000000000000711)).toBe(0);
  });

  it('should round to different number of decimals based on the second argument', () => {
    expect(roundTo(2.001, 3)).toBe(2.001);
    expect(roundTo(2.001)).toBe(2);
  });

  it('should handle small values with a larger multiplier value', () => {
    expect(roundTo(0.000234, 5)).toBe(0.00023);
  });
});
