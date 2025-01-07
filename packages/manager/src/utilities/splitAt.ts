/**
 * Splits an array into two parts at the given index.
 *
 * @param index - The index to split at.
 * @param input - The list (array) to split.
 * @returns An array containing two subarrays: the first part (0 to index), the second part (index to end).
 *
 * @example
 * splitAt(3, [1, 2, 3, 4, 5]); // [[1, 2, 3], [4, 5]]
 */
export function splitAt<T>(index: number, input: T[]): [T[], T[]];

/**
 * Splits a string into two parts at the given index.
 *
 * @param index - The index to split at.
 * @param input - The string to split.
 * @returns An array containing two strings: the first part (0 to index), the second part (index to end).
 *
 * @example
 * splitAt(3, "hello"); // ["hel", "lo"]
 */
export function splitAt(index: number, input: string): [string, string];

export function splitAt<T>(index: number, input: T[] | string) {
  return [input.slice(0, index), input.slice(index)];
}
