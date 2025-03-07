import { describe, expect, it } from 'vitest';

import { redactAccessToken } from './redactAccessToken';

describe('redactAccessToken', () => {
  it('should not mangle URLs without fragments', () => {
    const url = `http://www.linode.com`;
    const result = redactAccessToken(url);
    expect(result).toBe(url);
  });

  it('should not mangle URLS without access_tokens', () => {
    const url = `http://www.linode.com?something#whatever`;
    const result = redactAccessToken(url);
    expect(result).toBe(url);
  });

  it('should replace the access_token with REDACTED', () => {
    const url = `http://www.linode.com?something#whatever&access_token=ABC123`;
    const result = redactAccessToken(url);
    expect(result).toBe(
      `http://www.linode.com?something#whatever&access_token=REDACTED`
    );
  });
});
