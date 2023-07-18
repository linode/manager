/**
 * function useful for parsing user input and defaulting to a specified value
 * when the user input is blank
 */
export const defaultNumeric = (
  defaultValue: number,
  value?: null | number | string
) => {
  /** convert value to number if it's not undefined or null */
  const valueToNumber = !!value ? +value : value;

  /** return value only if it exists and is a number */
  return !!valueToNumber && valueToNumber !== 'NaN'
    ? valueToNumber
    : defaultValue;
};
