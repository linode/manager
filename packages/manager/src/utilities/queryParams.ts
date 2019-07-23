import { parse } from 'qs';
import { pathOr } from 'ramda';
import * as parseUrl from 'url-parse';

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

/**
 * Splits a string into at most two parts using a separator character.
 *
 * @param str The string to split
 * @param sep The separator character to use
 * @returns An array of length 2, which are the two separated parts of str
 */
export const splitIntoTwo = (str: string, sep: string): string[] => {
  const idx = str.indexOf(sep);
  if (idx === -1 || idx === str.length - 1) {
    throw new Error(`"${str}" cannot be split into two parts by ${sep}`);
  }
  return [str.substr(0, idx), str.substr(idx + 1)];
};
