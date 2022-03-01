/**
 * @file Utilities related to random string and number generation.
 */

/**
 * Describes options for generating a random string.
 */
interface randomStringOptions {
  /**
   * Whether random string should include lowercase alphabetical characters.
   */
  lowercase: boolean;

  /**
   * Whether random string should include uppercase alphabetical characters.
   */
  uppercase: boolean;

  /**
   * Whether random string should include numeric characters.
   */
  numbers: boolean;

  /**
   * Whether random string should include symbols.
   */
  symbols: boolean;

  /**
   * Whether random string should include space characters.
   */
  spaces: boolean;
}

// Default options for random string generation.
const defaultRandomStringOptions = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: false,
  spaces: false,
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
  return min + Math.floor(Math.random() * scaleMultiplier);
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
  options?: randomStringOptions
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
