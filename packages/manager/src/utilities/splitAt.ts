/**
 * Splits an array into two parts at the given index.
 *
 * @param index - The index to split at.
 * @param array - The list (array) to split.
 * @returns An array containing two subarrays: the first part (0 to index), the second part (index to end).
 *
 * @example
 * splitArrayAt(3, [1, 2, 3, 4, 5]); // [[1, 2, 3], [4, 5]]
 */
export const splitArrayAt = <T>(index: number, array: T[]) => {
  return [array.slice(0, index), array.slice(index)] as [T[], T[]];
};

/**
 * Splits a string into two parts at the given index.
 *
 * @param index - The index to split at.
 * @param string - string to split.
 * @returns An array containing two strings: the first part (0 to index), the second part (index to end).
 *
 * @example
 * splitStringAt(3, "hello"); // ["hel", "lo"]
 */
export const splitStringAt = (index: number, string: string) => {
  return [string.slice(0, index), string.slice(index)] as [string, string];
};
