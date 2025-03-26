/**
 * Specify props to compare arrays.
 * Note: This function is not recursive and will only be true if arrays are sorted equally.
 * The reason is that this function is intended to do the bare minimum for the sake of performance and its current use case(s).
 *
 * @param array1
 * @param array2
 *
 * @returns boolean
 */
export const areArraysEqual = <T>(array1: T[], array2: T[]): boolean => {
  return (
    array1.length === array2.length &&
    array1.every((v: T, i: number) => v === array2[i])
  );
};
