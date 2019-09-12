/**
 * Truncate a string with an ellipsis in the middle. Useful for filenames
 * where seeing the end of the string (i.e. the file extension) is desirable.
 */
export const truncateFileName = (objectName: string, maxLength = 40) => {
  if (maxLength < 5) {
    throw Error('maxLength must be greater than 5.');
  }

  // We need to accommodate the ellipsis
  const actualMax = maxLength - 3;

  if (objectName.length <= actualMax) {
    return objectName;
  }

  const firstHalf = objectName.substr(0, actualMax / 2);
  const secondHalf = objectName.substr(objectName.length - actualMax / 2);

  return firstHalf + '...' + secondHalf;
};
