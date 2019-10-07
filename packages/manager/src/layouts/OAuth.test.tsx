import { isEmpty } from 'ramda';
import { parseQueryParams } from 'src/utilities/queryParams';

describe('layouts/OAuth', () => {
  describe('parseQueryParams', () => {
    it('parses query params of the expected format', () => {
      const res = parseQueryParams('entity=key&color=bronze&weight=20%20grams');
      expect(res.entity).toBe('key');
      expect(res.color).toBe('bronze');
      expect(res.weight).toBe('20 grams');
    });

    it('returns an empty object for an empty string', () => {
      const res = parseQueryParams('');
      expect(isEmpty(res)).toBe(true);
    });

    it("doesn't truncate values that include =", () => {
      const res = parseQueryParams(
        'access_token=123456&return=https://localhost:3000/oauth/callback?returnTo=/asdf'
      );
      expect(res.access_token).toBe('123456');
      expect(res.return).toBe(
        'https://localhost:3000/oauth/callback?returnTo=/asdf'
      );
    });
  });
});
