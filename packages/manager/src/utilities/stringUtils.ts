/**
 * Join a list of strings for display. If the length of the list
 * is greater than the max, truncate the list before joining.
 *
 * ```typescript
 * truncateAndJoinList(['a', 'b', 'c'], 2) == 'a, b...and 1 more';
 * truncateAndJoinList(['a', 'b', 'c']) == 'a, b, c';
 * ```
 *
 * @param strList A list of strings to join and possibly truncate.
 * @param max The max number of elements to display.
 */

export const truncateAndJoinList = (strList: string[], max = 100) => {
  const count = strList.length;
  return count > max
    ? strList.slice(0, max).join(', ') + `...and ${count - max} more`
    : strList.join(', ');
};
