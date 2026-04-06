/**
 * Returns all elements of an array except the first one.
 * @param array The input array.
 * @returns An array with all elements of the input array except the first one.
 */

export function tail<T>(array: T[]): T[] {
  return array.slice(1);
}
