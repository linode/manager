import { describe, expect, it } from 'vitest';

import { getErrorText } from './error';

describe('getErrorText', () => {
  it('should return a string error text', () => {
    expect(getErrorText('Not Found')).toBe('Not Found');
  });

  it('should return an APIError error text', () => {
    expect(getErrorText([{ reason: 'Not Found' }])).toBe('Not Found');
  });
});
