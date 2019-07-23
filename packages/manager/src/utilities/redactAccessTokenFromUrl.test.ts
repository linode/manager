import redactAccessTokenFromUrl from './redactAccessTokenFromUrl';

describe('redactAccessTokenFromUrl', () => {
  it('should not mangle URLs without fragments', () => {
    const url = `http://www.linode.com`;
    const result = redactAccessTokenFromUrl(url);
    expect(result).toBe(url);
  });

  it('should not manel URLS without access_tokens', () => {
    const url = `http://www.linode.com?something#whatever`;
    const result = redactAccessTokenFromUrl(url);
    expect(result).toBe(url);
  });

  it('should replace the access_token with REDACTED', () => {
    const url = `http://www.linode.com?something#whatever&access_token=ABC123`;
    const result = redactAccessTokenFromUrl(url);
    expect(result).toBe(
      `http://www.linode.com?something#whatever&access_token=REDACTED`
    );
  });
});
