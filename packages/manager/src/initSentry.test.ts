import { normalizeErrorMessage } from './initSentry';

import type { APIError } from '@linode/api-v4/lib/types';

const INVALID_TOKEN = 'Invalid Token';

describe('normalizeErrorMessage', () => {
  it("returns the input untouched if it's already a string", () => {
    expect(normalizeErrorMessage(INVALID_TOKEN)).toBe(INVALID_TOKEN);
  });

  it("returns the API error reason if it's one APIError", () => {
    const apiError: APIError[] = [{ reason: INVALID_TOKEN }];
    expect(normalizeErrorMessage(apiError as any)).toBe(INVALID_TOKEN);
  });

  it("returns the input stringified if it's anything else", () => {
    expect(normalizeErrorMessage([INVALID_TOKEN] as any)).toBe(
      '["Invalid Token"]'
    );
    expect(normalizeErrorMessage(null as any)).toBe('null');
  });
});
