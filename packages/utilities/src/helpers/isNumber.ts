/**
 * Simple type guard to check if a value is a number
 * This util was introduced as a replacement for Lodash's `isNumber` function
 * Therefore, it performs the same checks as Lodash's implementation,
 * including respecting the "number" types for NaN, Infinity, and -Infinity
 *
 * @param value
 * @returns {boolean}
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}
