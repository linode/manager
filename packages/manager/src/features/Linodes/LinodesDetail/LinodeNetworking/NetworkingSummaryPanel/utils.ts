/**
 * Calculates the percentage of a value compared to a target.
 * @param value
 * @param target
 * @returns number
 */
export const calculatePercentageWithCeiling = (
  value: number,
  target: number
) => {
  return target > value ? 100 - ((target - value) * 100) / target : 100;
};
