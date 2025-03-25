/**
 * Helps you parse an environment variable that is intended to be a boolean.
 */
export function getBooleanEnv(value: boolean | string | undefined) {
  if (value === undefined) {
    return undefined;
  }
  if (value === true || value === 'true') {
    return true;
  }
  return false;
}
