import { hasInvalidNodePoolPrice } from './utils';

describe('hasInvalidNodePoolPrice', () => {
  it('returns false if the prices are both zero, which is valid', () => {
    expect(hasInvalidNodePoolPrice(0, 0)).toBe(false);
  });

  it('returns true if at least one of the prices is undefined', () => {
    expect(hasInvalidNodePoolPrice(0, undefined)).toBe(true);
    expect(hasInvalidNodePoolPrice(undefined, 0)).toBe(true);
    expect(hasInvalidNodePoolPrice(undefined, undefined)).toBe(true);
  });

  it('returns true if at least one of the prices is null', () => {
    expect(hasInvalidNodePoolPrice(0, null)).toBe(true);
    expect(hasInvalidNodePoolPrice(null, 0)).toBe(true);
    expect(hasInvalidNodePoolPrice(null, null)).toBe(true);
  });
});
