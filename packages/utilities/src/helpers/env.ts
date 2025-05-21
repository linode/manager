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

/**
 * Helps you parse an environment variable that is a comma seperated string
 */
export function getArrayFromCommaSeperatedList(value: unknown): string[] {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value.split(',');
}
