import { isEmpty } from 'ramda';

/**
 * Splits a string into at most two parts using a separator character.
 *
 * @param str The string to split
 * @param sep The separator character to use
 * @returns An array of length 2, which are the two separated parts of str
 */
export function splitIntoTwo(str: string, sep: string): string[] {
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
export function parseQueryParams(str: string) {
  return str
    .split('&')
    .reduce(
      (acc, keyVal) => {
        if (isEmpty(keyVal)) { return { ...acc }; }
        const [key, value] = splitIntoTwo(keyVal, '=');
        return { ...acc, [key]: value };
      },
      {},
    );
}
