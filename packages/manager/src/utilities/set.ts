type PropertyName = number | string | symbol;
type PropertyPath = PropertyName | readonly PropertyName[];

/**
 * Helper to set the given value at the given path of the given object.
 * This util is a direct replacement for `set` from lodash, with additional
 * checks to protect against prototype pollution.
 *
 * @param object — The object to modify.
 * @param path — The path of the property to set.
 * @param value — The value to set.
 * @return — Returns object.
 */
export function set<T extends object>(
  object: T,
  path: PropertyPath,
  value: any
): T {
  // ensure that object is actually an object
  if (!object || Array.isArray(object) || typeof object !== 'object') {
    return object;
  }

  // if the path is not an array, convert it to an array format
  const updatedPath = determinePath(path);

  if (
    // ensure that both the path and value will not lead to prototype pollution issues
    !isPrototypePollutionSafe(updatedPath)
  ) {
    return object;
  }

  let updatingObject: any = object;
  for (let i = 0; i < updatedPath.length - 1; i++) {
    const key = updatedPath[i];
    if (!updatingObject[key] || typeof updatingObject[key] !== 'object') {
      const nextKey = updatedPath[i + 1];
      updatingObject[key] = isValidIndex(nextKey) ? [] : {};
    }

    updatingObject = updatingObject[key];
  }

  // set value after reaching end of the path
  updatingObject[updatedPath[updatedPath.length - 1]] = value;

  return object;
}

/**
 * Helper to ensure a path cannot lead to a prototype pollution issue.
 *
 * @param path - The path to check
 * @return - If value is safe, returns it; otherwise returns undefined
 */
export const isPrototypePollutionSafe = (path: PropertyName[]): boolean => {
  return path.reduce((safeSoFar, val) => {
    let isCurKeySafe = true;
    if (typeof val === 'string') {
      isCurKeySafe =
        val !== '__proto__' && val !== 'prototype' && val !== 'constructor';
    }
    return safeSoFar && isCurKeySafe;
  }, true);
};

/**
 * Determines the path to set some value at, converting any string paths
 * into array format.
 *
 * @param path - The path to check
 * @returns - The path to set a value, in array format
 */
const determinePath = (path: PropertyPath): PropertyName[] => {
  return Array.isArray(path) ? path : path.toString().match(/[^.[\]]+/g) ?? [];
};

/**
 * Determines if the given value can be considered a valid index for an array.
 * For example, 0, 1, 2 are all valid index.
 * -1, 01, -01, 00, '1 1' are not.
 *
 * @param value - The value to check
 *
 * @returns - Returns boolean
 */
const isValidIndex = (value: PropertyName) => {
  const convertedValue = value.toString();

  return (
    /^\d+$/.test(convertedValue) && // must be all digits
    (convertedValue.length < 2 || !convertedValue.startsWith('0')) // must not start with 0 (unless it is 0 only)
  );
};
