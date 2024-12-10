import { describe, expect, it } from 'vitest';

import { clamp } from './clamp';

describe('clamp utility function', () => {
  it('clamps when the value is greater than the max', () => {
    expect(clamp(1, 3, 4)).toBe(3);
  });

  it('clamps when the value is less than the min', () => {
    expect(clamp(1, 3, 0)).toBe(1);
  });

  it('returns the value if no clamping is required', () => {
    expect(clamp(1, 3, 2)).toBe(2);
  });

  it('handles negative numbers', () => {
    expect(clamp(-5, 5, -6)).toBe(-5);
  });
});
