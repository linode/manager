/**
 * @file Utilities related to array handling.
 */

/**
 * Builds an array of the given length using the given builder function.
 *
 * @param length - Length of array to create.
 * @param builder - Function that creates an array item for the given index.
 *
 * @returns Created array.
 */
export const buildArray = <T>(
  length: number,
  builder: (index: number) => T
): T[] => {
  return new Array(length)
    .fill(null)
    .map((_item: null, i: number) => builder(i));
};

/**
 * Returns a copy of an array with its items sorted randomly.
 *
 * @param unsortedArray - Array to shuffle.
 *
 * @returns Copy of `unsortedArray` with its items sorted randomly.
 */
export const shuffleArray = <T>(unsortedArray: T[]): T[] => {
  return unsortedArray
    .map((value: T) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};
