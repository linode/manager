/**
 * Retrieves the value at the specified path in an object or array. If the value is undefined, returns the provided default value.
 * @param defaultValue {T} The value to return if the path is not found or the value is `undefined`
 * @param path {(string | number)[]} An array representing the path to the value in the object or array
 * @param object {Record<string, any> | undefined} The object or array to traverse
 * @returns {T} The value at the specified path, or the default value if the path is not found or is `undefined`
 */
export const pathOr = <T, O>(
  defaultValue: T,
  path: (number | string)[],
  object: O
): any =>
  path.reduce(
    (acc: any, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
    object
  ) ?? defaultValue;

/**
 * Compares two values for equality, including deep equality for objects and arrays.
 * @param a {*} The first value to compare
 * @param b {*} The second value to compare
 * @returns {boolean} `true` if the values are equal (deeply for objects and arrays), otherwise `false`
 */
export const equals = (a: any, b: any): boolean => {
  if (a === b) {
    return true;
  }

  // If both are objects/arrays, compare deeply
  if (
    typeof a === 'object' &&
    typeof b === 'object' &&
    a !== null &&
    b !== null
  ) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every((key) => equals(a[key], b[key])); // Recursively check each key-value pair
  }

  return false;
};
