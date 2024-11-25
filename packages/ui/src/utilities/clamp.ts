/**
 * Restricts a number to be within a range.
 */
export function clamp(min: number, max: number, value: number) {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
}
