import { describe, expect, it } from 'vitest';

import {
  getQueryParamFromQueryString,
  getQueryParamsFromQueryString,
} from './queryParams';

describe('Url/query parsing utilities', () => {
  describe('parseQueryParams function', () => {
    it('should parse a url', () => {
      expect(getQueryParamsFromQueryString('?query=false')).toEqual({
        query: 'false',
      });
    });
    it('should handle multiple key/value pairs', () => {
      expect(getQueryParamsFromQueryString('?query=false&this=that')).toEqual({
        query: 'false',
        this: 'that',
      });
    });
    it('should handle escaped whitespace', () => {
      expect(getQueryParamsFromQueryString('?query=this%20that')).toEqual({
        query: 'this that',
      });
    });
    it('should handle blank input', () => {
      expect(getQueryParamsFromQueryString('')).toEqual({});
    });
  });
  describe('getQueryParam method', () => {
    it('should get the value of a query parameter', () => {
      expect(getQueryParamFromQueryString('?query=false', 'query')).toEqual(
        'false',
      );
    });
    it('should return the default value if no value is present', () => {
      expect(
        getQueryParamFromQueryString('?query=', 'notaquery', 'defaultQuery'),
      ).toEqual('defaultQuery');
    });
    it('should handle a blank param value', () => {
      expect(
        getQueryParamFromQueryString('?query=', 'query', 'defaultQuery'),
      ).toEqual('');
    });
    it('should not care about the initial ?', () => {
      expect(getQueryParamFromQueryString('query=blue', 'query')).toEqual(
        'blue',
      );
    });
    it('should return a single query param from a URL string', () => {
      expect(
        getQueryParamFromQueryString(
          'https://example.com/?query=false&this=that',
          'this',
        ),
      ).toBe('that');
    });
    it('should return the default value if no value is present', () => {
      expect(
        getQueryParamFromQueryString(
          'https://example.com/?query=',
          'notaquery',
          'defaultQuery',
        ),
      ).toEqual('defaultQuery');
    });
  });
});
