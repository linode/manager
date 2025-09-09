import { beforeSend, normalizeErrorMessage } from './initSentry';

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

describe('beforeSend', () => {
  it('should return null when user agent contains Catchpoint', () => {
    const mockSentryEvent = {
      message: 'Some error occurred',
      request: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Catchpoint)',
        },
      },
    };

    const result = beforeSend(mockSentryEvent as any);
    expect(result).toBeNull();
  });

  it('should process normal events when user agent does not contain Catchpoint', () => {
    const mockSentryEvent = {
      message: 'Some error occurred',
      request: {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
    };

    const result = beforeSend(mockSentryEvent as any);
    expect(result).not.toBeNull();
    expect(result?.message).toBe('Some error occurred');
  });
});
