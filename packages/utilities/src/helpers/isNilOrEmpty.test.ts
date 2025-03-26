import { describe, expect, it } from 'vitest';

import { isNilOrEmpty } from './isNilOrEmpty';

describe('isNilOrEmpty function', () => {
  it('should return true if variable is null or undefined or empty object', () => {
    const x = null;
    const y = undefined;
    const obj = {};
    const arr: number[] = [];
    const set = new Set();
    const map = new Map();

    expect(isNilOrEmpty(x)).toBe(true);
    expect(isNilOrEmpty(y)).toBe(true);
    expect(isNilOrEmpty(obj)).toBe(true);
    expect(isNilOrEmpty(arr)).toBe(true);
    expect(isNilOrEmpty(set)).toBe(true);
    expect(isNilOrEmpty(map)).toBe(true);
  });

  it('should return false if variable is of not empty', () => {
    const str = 'test';
    const num = 15;
    const obj = { key: 'value' };

    expect(isNilOrEmpty(str)).toBe(false);
    expect(isNilOrEmpty(num)).toBe(false);
    expect(isNilOrEmpty(obj)).toBe(false);
  });

  it('should return false if an array, set or map is of not empty', () => {
    const arr: number[] = [1, 2, 3];
    const set = new Set([1, 2, 3]);
    const map = new Map([['key', 'value']]);

    expect(isNilOrEmpty(arr)).toBe(false);
    expect(isNilOrEmpty(set)).toBe(false);
    expect(isNilOrEmpty(map)).toBe(false);
  });
});
