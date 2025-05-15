/**
 * Retrieves the value at the specified path in an object or array. If the value is undefined, returns the provided default value.
 * @param defaultValue {T} The value to return if the path is not found or the value is `undefined`
 * @param path {(string | number)[]} An array representing the path to the value in the object or array
 * @param object {O} The object or array to traverse
 * @returns The value at the specified path, or the default value if the path is not found or is `undefined`
 */
export const pathOr = <T, O>(
  defaultValue: T,
  path: (number | string)[],
  object: O,
): T => {
  if (object === undefined) {
    return defaultValue;
  }

  let result: any = object;

  for (const key of path) {
    if (result === null || result[key] === undefined || result[key] == null) {
      return defaultValue; // Exit early if undefined or null
    }
    result = result[key];
  }

  return result;
};
