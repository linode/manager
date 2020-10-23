import { hasReadError } from './useReduxLoad';

const errorMessage = 'An error occurred.';

describe('hasReadError utility function', () => {
  it('returns `true` only if a "read" error is present', () => {
    expect(hasReadError({ read: errorMessage })).toBe(true);
    expect(hasReadError({})).toBe(false);
  });

  it('handles any input you throw at it', () => {
    expect(hasReadError(undefined)).toBe(false);
    expect(hasReadError(null)).toBe(false);
    expect(hasReadError(1234)).toBe(false);
    expect(hasReadError('1234')).toBe(false);
    expect(hasReadError(true)).toBe(false);
    expect(hasReadError(false)).toBe(false);
    expect(hasReadError([])).toBe(false);
  });
});
