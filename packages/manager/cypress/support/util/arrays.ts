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
