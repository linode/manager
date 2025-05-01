/**
 * Join a list of strings for display. If the length of the list
 * is greater than the max, truncate the list before joining.
 *
 * ```typescript
 * truncateAndJoinList(['a', 'b', 'c'], 2) == 'a, b...and 1 more';
 * truncateAndJoinList(['a', 'b', 'c']) == 'a, b, c';
 * ```
 *
 * @param strList
 * A list of strings to join and possibly truncate.
 * @param max
 * The max number of elements to display.
 */

export const truncateAndJoinList = (
  strList: string[],
  max = 100,
  total?: number,
) => {
  const count = strList.length;
  return count > max
    ? strList.slice(0, max).join(', ') +
        `, plus ${total ? total - max : count - max} more`
    : strList.join(', ');
};

export const wrapInQuotes = (s: string) => '"' + s + '"';

export const isNumeric = (s: string) => /^\d+$/.test(s);
