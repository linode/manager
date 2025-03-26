import { describe, expect, it } from 'vitest';

import { sortByVersion } from './sort-by';

describe('sortByVersion', () => {
  it('should identify the later major version as greater', () => {
    const result = sortByVersion('2.0.0', '1.0.0', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later minor version as greater', () => {
    const result = sortByVersion('1.2.0', '1.1.0', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later patch version as greater', () => {
    const result = sortByVersion('1.1.2', '1.1.1', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later minor version with differing number of digits', () => {
    const result = sortByVersion('1.30', '1.3', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should return negative when the first version is earlier in ascending order', () => {
    const result = sortByVersion('1.0.0', '2.0.0', 'asc');
    expect(result).toBeLessThan(0);
  });

  it('should return positive when the first version is earlier in descending order', () => {
    const result = sortByVersion('1.0.0', '2.0.0', 'desc');
    expect(result).toBeGreaterThan(0);
  });

  it('should return zero when versions are equal', () => {
    const result = sortByVersion('1.2.3', '1.2.3', 'asc');
    expect(result).toEqual(0);
  });
});
