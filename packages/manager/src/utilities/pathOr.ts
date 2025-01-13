/**
 * Retrieves the value at the specified path in an object or array. If the value is undefined, returns the provided default value.
 * @param defaultValue {T} The value to return if the path is not found or the value is `undefined`
 * @param path {(string | number)[]} An array representing the path to the value in the object or array
 * @param object {Record<string, any> | undefined} The object or array to traverse
 * @returns The value at the specified path, or the default value if the path is not found or is `undefined`
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
