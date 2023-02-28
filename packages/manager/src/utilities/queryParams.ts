import { parse } from 'qs';
import { pathOr } from 'ramda';
import parseUrl from 'url-parse';

/**
 * Parses a string of key/value pairs separated by '&', with the key and value separated by '='
 *
 * @param str The string to parse
 * @returns An object of the parsed key/value pairs
 */
export const parseQueryParams = (str: string) =>
  parse(str, { ignoreQueryPrefix: true });

export const getQueryParam = (
  str: string,
  paramName: string,
  defaultValue: string = ''
) => {
  const params = parseQueryParams(str);
  return pathOr(defaultValue, [paramName], params);
};

export const getParamsFromUrl = (url: string) => {
  const parsedUrl = parseUrl(url) as any;
  return parseQueryParams(parsedUrl.query);
};

export const getParamFromUrl = (
  url: string,
  paramName: string,
  defaultValue: string = ''
): string => {
  const parsedUrl = parseUrl(url) as any;
  return getQueryParam(parsedUrl.query, paramName, defaultValue);
};
