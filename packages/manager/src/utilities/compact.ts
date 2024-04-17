/**
 * Removes all falsy values from an array.
 *
 * @param array
 * @returns Array without falsy values
 */
export const compact = <T>(array: T[]): T[] => {
  return array.filter(Boolean);
};
