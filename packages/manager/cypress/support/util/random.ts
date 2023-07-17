/**
 * @file Utilities related to random string and number generation.
 */

import { entityPrefix } from 'support/constants/cypress';

/**
 * Describes options for generating a random string.
 */
interface RandomStringOptions {
  // / Whether random string should include lowercase alphabetical characters.
  lowercase: boolean;

  // / Whether random string should include numeric characters.
  numbers: boolean;

  // / Whether random string should include space characters.
  spaces: boolean;

  // / Whether random string should include symbols.
  symbols: boolean;

  // / Whether random string should include uppercase alphabetical characters.
  uppercase: boolean;
}

// Default options for random string generation.
const defaultRandomStringOptions = {
  lowercase: true,
  numbers: true,
  spaces: false,
  symbols: false,
  uppercase: true,
};

/**
 * Generates a random number within a range.
 *
 * Unless specified, the returned number is between 0 and 100.
 *
 * @param min - Inclusive minimum for random number. Default `0`.
 * @param max - Inclusive maximum for random number. Default `100`.
 *
 * @returns Random number between `min` and `max`.
 */
export const randomNumber = (min: number = 0, max: number = 100): number => {
  const scaleMultiplier = max - min;
  return min + Math.round(Math.random() * scaleMultiplier);
};

/**
 * Returns a random item from an array.
 *
 * @param array - Array from which to retrieve random item.
 *
 * @returns Random item from array `array`.
 */
export const randomItem = (array: Array<any>): any => {
  const index = randomNumber(0, array.length - 1);
  return array[index];
};

/**
 * Returns a random string of the given length.
 *
 * An options object may be passed to configure the random string.
 *
 * @param length - String length. Default `8`.
 *
 * @returns Random string.
 */
export const randomString = (
  length: number = 8,
  options?: RandomStringOptions
): string => {
  const stringOptions = options ? options : defaultRandomStringOptions;

  const alphaLowercase = 'abcdefghijklmnopqrstuvwxyz';
  const alphaUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '1234567890';
  const symbols = '!@#$%^&*()[]-_.,<>/?`~';
  const spaces = ' ';

  const characterSelection = [
    ...(stringOptions.lowercase ? [alphaLowercase] : []),
    ...(stringOptions.uppercase ? [alphaUppercase] : []),
    ...(stringOptions.numbers ? [numbers] : []),
    ...(stringOptions.symbols ? [symbols] : []),
    ...(stringOptions.spaces ? [spaces] : []),
  ]
    .join('')
    .split('');

  let output = '';
  for (let i = 0; i < length; i++) {
    output += randomItem(characterSelection);
  }

  return output;
};

/**
 * Creates a random label that has a test entity prefix.
 *
 * @example
 * // Assumes that test entity prefix is `cy-test-`.
 * randomLabel(); // Example output: `cy-test-prcxfnmafe`
 * randomLabel(5); // Example output: `cy-test-bkwpo`
 *
 * @param length - Length of random label, not including length of test entity prefix.
 *
 * @returns Random test label.
 */
export const randomLabel = (length: number = 10): string => {
  const randomStringOptions = {
    lowercase: true,
    numbers: false,
    spaces: false,
    symbols: false,
    uppercase: false,
  };

  return `${entityPrefix}${randomString(length, randomStringOptions)}`;
};

/**
 * Creates a random domain name that has a test entity prefix.
 *
 * @example
 * // Assumes that test entity prefix is `cy-test-`.
 * randomDomain(); // Example output: `cy-test-prcxfnmafe.com`
 * randomDomain(5); // Example output: `cy-test-bkwpo.net`
 *
 * @param length - Length of random domain name, not including length of test entity prefix or TLD.
 *
 * @returns Random domain name.
 */
export const randomDomainName = (length: number = 10): string => {
  const tlds = ['net', 'com', 'org'];

  return `${randomLabel(length)}.${randomItem(tlds)}`;
};

/**
 * Returns a random IPv4 address.
 *
 * @example
 * randomIp(); // Example output: `3.196.83.89`
 *
 * @returns Random IPv4 address.
 */
export const randomIp = () => {
  const randomOctet = () => randomNumber(0, 254);
  return `${randomOctet()}.${randomOctet()}.${randomOctet()}.${randomOctet()}`;
};

/**
 * Returns a random phone number.
 *
 * The three digits following the area code will always be '555'.
 *
 * @param randomCountryCode - Whether country code should be random. If not, '1' is used.
 *
 * @example
 * randomPhoneNumber(); // Example output: `+19965551794`.
 * randomPhoneNumber(false); // Equivalent to above.
 * randomPhoneNumber(true); // Example output: `+2642285555485`.
 *
 * @returns Random phone number.
 */
export const randomPhoneNumber = (
  randomCountryCode: boolean = false
): string => {
  const countryCode = randomCountryCode ? randomNumber(1, 999) : 1;
  return `+${countryCode}${randomNumber(100, 999)}555${randomNumber(
    1000,
    9999
  )}`;
};

/**
 * Returns a random phrase of random strings.
 *
 * @param count - Number of strings to include in phrase.
 *
 * @returns Random phrase.
 */
export const randomPhrase = (count: number = 5): string => {
  return [...Array(count)]
    .map(() => {
      const length = randomNumber(3, 9);
      return randomString(length, {
        lowercase: true,
        numbers: false,
        spaces: false,
        symbols: false,
        uppercase: false,
      });
    })
    .join(' ');
};

/**
 * Generates a random string which resembles a v4 UUID.
 *
 * This does not generate a valid UUID, nor does it offer the same guarantees as
 * a UUID. Instead, it is intended to be used when generating values for mocks
 * or when filling in fields which expect UUID values.
 *
 * @returns Random string which resembles a v4 UUID.
 */
export const randomUuid = (): string => {
  const randomStringOptions = {
    lowercase: false,
    numbers: true,
    spaces: false,
    symbols: false,
    uppercase: true,
  };

  return [
    randomString(8, randomStringOptions),
    randomString(4, randomStringOptions),
    randomString(4, randomStringOptions),
    randomString(4, randomStringOptions),
    randomString(12, randomStringOptions),
  ].join('-');
};

/**
 * Returns a random hexadecimal string of a given length.
 *
 * @param length - Length of the hexadecimal string.
 *
 * @returns Random hexadecimal string.
 */
export const randomHex = (length: number = 64): string => {
  const hexNumber = '0123456789abcdef';

  const characterSelection = hexNumber.split('');

  let output = '';
  for (let i = 0; i < length; i++) {
    output += randomItem(characterSelection);
  }

  return output;
};
