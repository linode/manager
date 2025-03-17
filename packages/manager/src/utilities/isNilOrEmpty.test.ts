import { isNilOrEmpty } from './isNilOrEmpty';

describe('isNilOrEmpty function', () => {
  it('should return true if variable is null or undefined or empty object', () => {
    const x = null;
    const y = undefined;
    const obj = {};

    expect(isNilOrEmpty(x)).toBe(true);
    expect(isNilOrEmpty(y)).toBe(true);
    expect(isNilOrEmpty(obj)).toBe(true);
  });

  it('should return false if variable is of not empty', () => {
    const str = 'test';
    const num = 15;
    const obj = { key: 'value' };

    expect(isNilOrEmpty(str)).toBe(false);
    expect(isNilOrEmpty(num)).toBe(false);
    expect(isNilOrEmpty(obj)).toBe(false);
  });
});
