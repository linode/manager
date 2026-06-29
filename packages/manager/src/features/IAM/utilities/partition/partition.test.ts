import { describe, expect, it } from 'vitest';

import { partition } from './partition';

describe('partition', () => {
  it('should partition given array into two based on predicate passed in', () => {
    expect(partition([0, 4, 1, 6, 8, 9, 2, 3], (n) => n % 2 === 0)).toEqual([
      [0, 4, 6, 8, 2],
      [1, 9, 3],
    ]);

    expect(partition([0, 4, 1, 6, 8, 9, 2, 3], (n) => n > 9)).toEqual([
      [],
      [0, 4, 1, 6, 8, 9, 2, 3],
    ]);

    expect(
      partition(['aaa', 'abc', 'and'], (s) => s.indexOf('a') >= 0)
    ).toEqual([['aaa', 'abc', 'and'], []]);
  });
});
