/**
 * Truncate a string with an ellipsis in the middle.
 */
export const truncateMiddle = (objectName: string, maxLength = 40) => {
  if (objectName.length <= maxLength) {
    return objectName;
  }

  if (maxLength < 5) {
    throw Error('maxLength must be greater than 5.');
  }

  // We need to accommodate the ellipsis
  const actualMax = maxLength - 3;

  const firstHalf = objectName.substr(0, actualMax / 2);
  const secondHalf = objectName.substr(objectName.length - actualMax / 2);

  return firstHalf + '...' + secondHalf;
};

/**
 * Truncate a string with an ellipsis at the end.
 */
export const truncateEnd = (folderName: string, maxLength = 40) => {
  if (folderName.length <= maxLength) {
    return folderName;
  }

  if (maxLength < 4) {
    throw Error('maxLength must be greater than 4.');
  }

  // We need to accommodate the ellipsis
  const actualMax = maxLength - 3;

  return folderName.substr(0, actualMax) + '...';
};
