import { parse } from 'qs';
import { pathOr } from 'ramda';

/**
 * Splits a string into at most two parts using a separator character.
 *
 * @param str The string to split
 * @param sep The separator character to use
 * @returns An array of length 2, which are the two separated parts of str
 */
export const splitIntoTwo = (str: string, sep: string): string[] => {
  const idx = str.indexOf(sep);
  if (idx === -1 || idx === (str.length - 1)) {
    throw new Error(`"${str}" cannot be split into two parts by ${sep}`);
  }
  return [str.substr(0, idx), str.substr(idx + 1)];
}

/**
 * Parses a string of key/value paris separated by '&', with the key and value separated by '='
 *
 * @param str The string to parse
 * @returns An object of the parsed key/value pairs
 */
export const parseQueryParams = (str: string) => {
  // qs library doesn't handle initial ? or # delimiters automatically
  const queryString = str.replace(/^[\?|\#]/, '');
  return parse(queryString);
}

export const getQueryParam = (str: string, paramName: string, defaultValue: string = '') => {
  const params = parseQueryParams(str);
  return pathOr(defaultValue, [paramName], params);
}