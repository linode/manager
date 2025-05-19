import { describe, expect, it } from 'vitest';

import { sortByTieredVersion, sortByVersion } from './sort-by';

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

describe('sortByTieredVersion', () => {
  it('should identify the later standard tier major version as greater', () => {
    const result = sortByTieredVersion('2.0.0', '1.0.0', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later standard tier minor version as greater', () => {
    const result = sortByTieredVersion('1.2.0', '1.1.0', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later standard tier patch version as greater', () => {
    const result = sortByTieredVersion('1.1.2', '1.1.1', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later enterprise tier patch version as greater', () => {
    const result = sortByTieredVersion('v1.1.2+lke1', 'v1.1.1+lke1', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the enterprise tier patch version with the later enterprise release version as greater', () => {
    const result = sortByTieredVersion('v1.1.1+lke2', 'v1.1.1+lke1', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should identify the later standard tier minor version with differing number of digits', () => {
    const result = sortByTieredVersion('1.30', '1.3', 'asc');
    expect(result).toBeGreaterThan(0);
  });

  it('should return negative when the first version is earlier in ascending order with standard tier versions', () => {
    const result = sortByTieredVersion('1.0.0', '2.0.0', 'asc');
    expect(result).toBeLessThan(0);
  });

  it('should return positive when the first version is earlier in descending order with standard tier versions', () => {
    const result = sortByTieredVersion('1.0.0', '2.0.0', 'desc');
    expect(result).toBeGreaterThan(0);
  });

  it('should return negative when the first version is earlier in ascending order with enterprise tier versions', () => {
    const result = sortByTieredVersion('v1.0.0+lke1', 'v2.0.0+lke1', 'asc');
    expect(result).toBeLessThan(0);
  });

  it('should return positive when the first version is earlier in descending order with enterprise tier versions', () => {
    const result = sortByTieredVersion('v1.0.0+lke1', 'v2.0.0+lke1', 'desc');
    expect(result).toBeGreaterThan(0);
  });

  it('should return zero when standard tier versions are equal', () => {
    const result = sortByTieredVersion('1.2.3', '1.2.3', 'asc');
    expect(result).toEqual(0);
  });

  it('should return zero when enterprise tier versions are equal', () => {
    const result = sortByTieredVersion('v1.2.3+lke1', 'v1.2.3+lke1', 'asc');
    expect(result).toEqual(0);
  });
});
