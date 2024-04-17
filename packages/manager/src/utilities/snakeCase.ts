/**
 * Simple utility function to convert a string to snake case
 *
 * @param str the string to convert to snake case
 * @returns the string in snake case
 */
export const snakeCase = (str: string | undefined): string => {
  if (!str) {
    return '';
  }

  return str
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};
