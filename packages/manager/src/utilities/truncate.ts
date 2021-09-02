/**
 * Truncate a string and add an ellipsis at the end but ensures the
 * text ends on a word rather than mid-word.
 */
export const truncate = (str: string, maxLength: number) => {
  if (str.length > maxLength + 4) {
    const beginningText = str.substring(0, maxLength + 1);
    const charsAfterMax = str.substring(maxLength + 1);
    const result = [beginningText];

    // Now we that we have the initial text, we want to ensure that
    // we're ending at the end of a word rather than at the middle,
    // so we want to find the first occurrence of whitespace and end
    // the string there
    for (const letter of charsAfterMax) {
      // A space means we're at the end of the word so break out of
      // this loop
      if (letter.match(/\W/)) {
        break;
      }
      result.push(letter);
    }
    return `${result.join('')} ...`;
  }

  return str;
};

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
