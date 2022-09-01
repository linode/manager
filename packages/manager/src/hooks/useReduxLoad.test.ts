import { hasError } from './useReduxLoad';

const errorMessage = 'An error occurred.';

describe('hasError utility function', () => {
  it('EntityError: returns `true` only if a "read" error is present', () => {
    expect(hasError({ read: errorMessage })).toBe(true);
    expect(hasError({})).toBe(false);
  });

  it('APIError[]: returns `true` if an error is present', () => {
    expect(hasError([{ reason: errorMessage }])).toBe(true);
    expect(hasError([])).toBe(false);
  });

  it('handles any input you throw at it', () => {
    expect(hasError(undefined)).toBe(false);
    expect(hasError(null)).toBe(false);
    expect(hasError(1234)).toBe(false);
    expect(hasError('1234')).toBe(false);
    expect(hasError(true)).toBe(false);
    expect(hasError(false)).toBe(false);
    expect(hasError([])).toBe(false);
  });
});
