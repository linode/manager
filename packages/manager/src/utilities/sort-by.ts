import { parseAPIDate } from 'src/utilities/date';
import { formatRegion } from 'src/utilities/formatRegion';
type SortOrder = 'asc' | 'desc';

export type SortFunction = (a: any, b: any, order?: SortOrder) => number;
export type SortComparator = (a: any, b: any) => number;

/**
 * Inverts the result of a sort function if the sort order is descending.
 *
 * @example
 * invertIfDescending(1, 'asc'); // Returns 1.
 * invertIfDescending(1, 'desc'); // Returns -1.
 * invertIfDescending(-1, 'desc'); // Returns 1.
 * invertIfDescending(0, 'asc'); // Returns 0.
 * invertIfDescending(0, 'desc'); // Returns 0.
 *
 * @param value - Value that may be inverted.
 * @param order - Sort order. If `desc`, `value` will be inverted.
 *
 * @returns `value` multiplied by `-1` if `order` is `desc`, otherwise `value`.
 */
const invertIfDescending = (
  value: number,
  order: SortOrder = 'asc'
): number => {
  if (value === 0 || order === 'asc') {
    return value;
  }
  return value * -1;
};

/**
 * Converts sort util functions to `Array.prototype.sort()` comparators.
 *
 * @example
 * ["b", "a", "c"].sort(toComparator(sortByString)); // Returns ["a", "b", "c"].
 * ["b", "a", "c"].sort(toComparator(sortByString, "desc")); // Returns ["c", "b", "a"].
 *
 * @param func - Sort util function to convert to comparator.
 * @param order - Sort order for resulting comparator.
 *
 * @returns Sort comparator function to pass to `Array.prototype.sort()`.
 */
export const toComparator = (
  func: SortFunction,
  order: SortOrder = 'asc'
): SortComparator => {
  return (a: any, b: any): number => func(a, b, order);
};

/**
 * Sorts two strings alphabetically.
 *
 * @param a - First string to compare.
 * @param b - Second string to compare.
 * @param order - Sort order.
 *
 * @returns Result of comparing strings alphabetically; either `-1`, `0`, or `1`.
 */
export const sortByString: SortFunction = (
  a: string,
  b: string,
  order: SortOrder = 'asc'
) => {
  // @TODO Adjust locale according to user's region when we work on i18n.
  return invertIfDescending(a.localeCompare(b, 'en', { numeric: true }), order);
};

/**
 * Sorts two UTF date strings.
 *
 * @param a - First UTF date string to compare.
 * @param b - Second UTF date string to compare.
 * @param order - Sort order.
 *
 * @returns Result of comparing UTF date strings; either `-1`, `0`, `1`.
 */
export const sortByUTFDate: SortFunction = (
  a: string,
  b: string,
  order: SortOrder = 'asc'
) => {
  const dateDiff = parseAPIDate(a).diff(parseAPIDate(b)).valueOf();

  if (dateDiff === 0) {
    return 0;
  }

  const result = dateDiff > 0 ? 1 : -1;
  return invertIfDescending(result, order);
};

/**
 * Sorts two numbers.
 *
 * @param a - First number to compare.
 * @param b - Second number to compare.
 * @param order - Sort order.
 *
 * @returns Result of comparing numbers; either `-1`, `0`, or `1`.
 */
export const sortByNumber: SortFunction = (
  a: number,
  b: number,
  order: SortOrder = 'asc'
) => {
  if (a === b) {
    return 0;
  }
  const result = a > b ? 1 : -1;
  return invertIfDescending(result, order);
};

/**
 * Sorts two arrays by their length.
 *
 * @param a - First array to compare.
 * @param b - Second array to compare.
 * @param order - Sort order.
 *
 * @returns Result of comparing array lengths; either `-1`, `0`, or `1`.
 */
export const sortByArrayLength: SortFunction = (
  a: any[],
  b: any[],
  order: SortOrder = 'asc'
) => {
  let result = 0;
  if (a.length > b.length) {
    result = 1;
  } else if (a.length < b.length) {
    result = -1;
  }
  return invertIfDescending(result, order);
};

/**
 * Sort function to sort region strings according to their display names.
 *
 * @param a - First region string to compare.
 * @param b - Second region string to compare.
 * @param order - Sort order.
 *
 * @returns Result of comparing region labels; either `-1`, `0`, or `1`.
 */
export const sortByRegionLabel: SortFunction = (
  a: string,
  b: string,
  order: SortOrder = 'asc'
): number => {
  const regionLabelA = formatRegion(a);
  const regionLabelB = formatRegion(b);
  return sortByString(regionLabelA, regionLabelB, order);
};
