import { describe, expect, it } from 'vitest';

import { areArraysEqual } from './areArraysEqual';

describe('compare arrays', () => {
  const array1: string[] = ['104.237.150.6', '192.168.216.240'];

  it('should return `true` if the given arrays are the same.', () => {
    const array2: string[] = ['104.237.150.6', '192.168.216.240'];
    const result = areArraysEqual(array1, array2);

    expect(result).toBe(true);
  });

  it('should return `false` if the given arrays contain different data types', () => {
    const array2: (number | string)[] = [10, 2];
    const result = areArraysEqual(array1, array2);

    expect(result).toBe(false);
  });

  it('should return `false` if the given arrays have the same elements in different order.', () => {
    const array2: string[] = ['192.168.216.240', '104.237.150.6'];
    const result = areArraysEqual(array1, array2);

    expect(result).toBe(false);
  });

  it('should return `false` if the given arrays have different values', () => {
    const array3: string[] = ['104.237.150.6', '192.168.216.241'];
    const result = areArraysEqual(array1, array3);

    expect(result).toBe(false);
  });

  it('should return `false` if the given arrays have different sizes', () => {
    const array4: string[] = [
      '104.237.150.6',
      '192.168.216.240',
      '143.42.184.169',
    ];
    const result = areArraysEqual(array1, array4);

    expect(result).toBe(false);
  });
});
