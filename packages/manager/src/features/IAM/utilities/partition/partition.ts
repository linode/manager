/**
 * Partitions an array into two results based on a predicate function.
 *
 * @param predicate - A function that takes an element and returns a boolean.
 * @param array - The array to partition.
 */
export const partition = <T>(
  array: T[],
  predicate: (value: T) => boolean
): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];

  array.forEach((value) => {
    if (predicate(value)) {
      pass.push(value);
    } else {
      fail.push(value);
    }
  });

  return [pass, fail];
};
