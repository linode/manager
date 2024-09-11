import { isEmpty } from 'ramda';

import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import type { OAuthQueryParams } from './OAuth';

describe('layouts/OAuth', () => {
  describe('parseQueryParams', () => {
    it('parses query params of the expected format', () => {
      const res = getQueryParamsFromQueryString<OAuthQueryParams>(
        'entity=key&color=bronze&weight=20%20grams'
      );
      expect(res.entity).toBe('key');
      expect(res.color).toBe('bronze');
      expect(res.weight).toBe('20 grams');
    });

    it('returns an empty object for an empty string', () => {
      const res = getQueryParamsFromQueryString<OAuthQueryParams>('');
      expect(isEmpty(res)).toBe(true);
    });

    it("doesn't truncate values that include =", () => {
      const res = getQueryParamsFromQueryString<OAuthQueryParams>(
        'access_token=123456&return=https://localhost:3000/oauth/callback?returnTo=/asdf'
      );
      expect(res.access_token).toBe('123456');
      expect(res.return).toBe(
        'https://localhost:3000/oauth/callback?returnTo=/asdf'
      );
    });
  });
});
