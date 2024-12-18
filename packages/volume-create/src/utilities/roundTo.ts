/**
 * Round to a given number of decimals, by default 2.
 * This is different from toFixed and similar methods,
 * because we only want to append decimals if they are
 * significant.
 *
 * Example:
 *
 * 2.toFixed(2) = '2.00'
 * roundTo(2) = 2
 * roundTo(0.01) = 0.01
 * roundTo(0.000234, 5) = 0.00023
 *
 * @param value
 * @param places (Optional) Number of decimal places to round to
 */
export const roundTo = (value: number, places: number = 2) => {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
};
