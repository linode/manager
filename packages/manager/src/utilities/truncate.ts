/**
 * Truncate a string and add an ellipsis in the middle.
 */
export const truncateMiddle = (str: string, maxLength = 40) => {
  if (str.length <= maxLength) {
    return str;
  }

  // We need a length of at least 5 for the result to make sense.
  // truncateMiddle('aaaaa') === 'a...a'
  if (maxLength < 5) {
    throw Error('maxLength must be greater than 5.');
  }

  // We need to accommodate the ellipsis
  const actualMax = maxLength - 3;

  const firstHalf = str.substr(0, actualMax / 2);
  const secondHalf = str.substr(str.length - actualMax / 2);

  return firstHalf + '...' + secondHalf;
};

/**
 * Truncate a string and add an ellipsis at the end.
 */
export const truncateEnd = (str: string, maxLength = 40) => {
  if (str.length <= maxLength) {
    return str;
  }

  // We need a length of at least 4 for the result to make sense.
  // truncateMiddle('aaaa') === 'a...'
  if (maxLength < 4) {
    throw Error('maxLength must be greater than 4.');
  }

  // We need to accommodate the ellipsis
  const actualMax = maxLength - 3;

  return str.substr(0, actualMax) + '...';
};
