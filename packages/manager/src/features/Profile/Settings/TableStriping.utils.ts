/**
 * Given the raw table striping preference, this functions returns whether or not
 * striping should be enabled.
 *
 * If the user's table striping preference is `undefined`, we will enable table striping
 * because we want it to be enabled by default.
 *
 * @param value the table striping preference value
 * @returns `true` if the preference is true or `undefined` and `false` if the preference is false
 */
export function getIsTableStripingEnabled(value: boolean | undefined) {
  if (value === undefined) {
    // If no preference is set, enable table striping by default
    return true;
  }

  return value;
}
