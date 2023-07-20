/**
 * Partitions an array into two arrays, the first containing
 * elements matching the predicate and the second containing
 * the rest.
 */
export const partition = <T>(predicate: (val: T) => boolean, array: T[]) =>
  array.reduce<[T[], T[]]>(
    (acc, val) => {
      acc[predicate(val) ? 0 : 1].push(val);
      return acc;
    },
    [[], []]
  );
