import { describe, expect, it } from 'vitest';

import { isNumber } from './isNumber';

describe('isNumber utility function', () => {
  it('should return true when passed a number', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(1)).toBe(true);
    expect(isNumber(-1)).toBe(true);
    expect(isNumber(1.1)).toBe(true);
    expect(isNumber(-1.1)).toBe(true);
  });

  it('should return false when passed a non-number', () => {
    expect(isNumber('0')).toBe(false);
    expect(isNumber('1')).toBe(false);
    expect(isNumber('-1')).toBe(false);
    expect(isNumber('1.1')).toBe(false);
    expect(isNumber('-1.1')).toBe(false);
    // NaN's type is "number"
    // So are Infinity and -Infinity types
    expect(isNumber(NaN)).toBe(true);
    expect(isNumber(Infinity)).toBe(true);
    expect(isNumber(-Infinity)).toBe(true);

    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber(() => null)).toBe(false);
  });
});
