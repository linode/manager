import { compact } from './compact';

describe('compact', () => {
  it('should remove all falsy values', () => {
    const result = compact([
      -0,
      0,
      1,
      false,
      2,
      '',
      3,
      null,
      undefined,
      4,
      NaN,
      5,
    ]);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
