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
  total?: number
) => {
  const count = strList.length;
  return count > max
    ? strList.slice(0, max).join(', ') +
        `, plus ${total ? total - max : count - max} more`
    : strList.join(', ');
};

export const wrapInQuotes = (s: string) => '"' + s + '"';

export const isNumeric = (s: string) => /^\d+$/.test(s);

const getNumberMatch = (str: string) => {
  let match = '';

  // Start from the end of string and work backwards
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];
    // Check if character is a digit
    if (char >= '0' && char <= '9') {
      match = char + match;
    } else {
      // Stop when we hit a non-digit
      break;
    }
  }

  return match;
};

export function getNumberAtEnd(str: string) {
  const match = getNumberMatch(str);

  // If there is a match, return the matched number; otherwise, return null
  return match ? parseInt(match, 10) : null;
}

export function removeNumberAtEnd(str: string) {
  const match = getNumberMatch(str);

  // Use the replace() method to remove the matched portion
  return str.replace(match, '');
}

/**
 * Gets the next available unique entity label
 */
export function getNextLabel<T extends { label: string }>(
  selectedEntity: T,
  allEntities: T[]
): string {
  const numberAtEnd = getNumberAtEnd(selectedEntity.label);

  let labelToReturn = '';

  if (numberAtEnd === null) {
    labelToReturn = `${selectedEntity.label}-1`;
  } else {
    labelToReturn = `${removeNumberAtEnd(selectedEntity.label)}${
      numberAtEnd + 1
    }`;
  }

  if (allEntities.some((r) => r.label === labelToReturn)) {
    return getNextLabel(
      { ...selectedEntity, label: labelToReturn },
      allEntities
    );
  }
  return labelToReturn;
}
