import isPathOneOf from './isPathOneOf';

describe('isPathOneOf', () => {
  it('should return true when path is one of', () => {
    const result = isPathOneOf(['/linodes'], '/linodes/1234');

    expect(result).toBe(true);
  });

  it('should return false when path is not one of', () => {
    const result = isPathOneOf(['/linodes'], '/shenanigans/1234');

    expect(result).toBe(false);
  });

  it('should return true when path is not one of', () => {
    const result = isPathOneOf(
      ['/volumes', '/linodes', '/images'],
      '/linodes/1234'
    );
    expect(result).toBe(true);
  });
});
