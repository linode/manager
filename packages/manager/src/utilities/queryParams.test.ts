import {
  getParamFromUrl,
  getParamsFromUrl,
  getQueryParam
} from './queryParams';

describe('Url/query parsing utilities', () => {
  describe('getParamsFromUrl function', () => {
    it('should parse a url', () => {
      expect(getParamsFromUrl('https://example.com/?query=false')).toEqual({
        query: 'false'
      });
    });
    it('should handle multiple key/value pairs', () => {
      expect(
        getParamsFromUrl('https://example.com/?query=false&this=that')
      ).toEqual({ query: 'false', this: 'that' });
    });
    it('should handle escaped whitespace', () => {
      expect(
        getParamsFromUrl('https://example.com/?query=this%20that')
      ).toEqual({ query: 'this that' });
    });
    it('should handle blank input', () => {
      expect(getParamsFromUrl('')).toEqual({});
    });
  });
  describe('getQueryParam function', () => {
    it('should get the value of a query parameter', () => {
      expect(getQueryParam('?query=false', 'query')).toEqual('false');
    });
    it('should return the default value if no value is present', () => {
      expect(getQueryParam('?query=', 'notaquery', 'defaultQuery')).toEqual(
        'defaultQuery'
      );
    });
    it('should handle a blank param value', () => {
      expect(getQueryParam('?query=', 'query', 'defaultQuery')).toEqual('');
    });
    it('should not care about the initial ?', () => {
      expect(getQueryParam('query=blue', 'query')).toEqual('blue');
    });
  });
  describe('getParamFromUrl method', () => {
    it('should return a single query param from a URL string', () => {
      expect(
        getParamFromUrl('https://example.com/?query=false&this=that', 'this')
      ).toBe('that');
    });
    it('should return the default value if no value is present', () => {
      expect(
        getQueryParam(
          'https://example.com/?query=',
          'notaquery',
          'defaultQuery'
        )
      ).toEqual('defaultQuery');
    });
  });
});
