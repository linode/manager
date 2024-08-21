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
    !isKeyPrototypePollutionSafe(updatedPath)
  ) {
    return object;
  }

  let updatingObject: any = object;
  for (let i = 0; i < updatedPath.length - 1; i++) {
    const key = updatedPath[i];
    if (!updatingObject[key] || typeof updatingObject[key] !== 'object') {
      const nextKey = updatedPath[i + 1];
      // this line has to be changed, because "01" should lead to an object's keys, not an array
      updatingObject[key] = Number.isNaN(nextKey) ? {} : [];
    }

    updatingObject = updatingObject[key];
  }

  // set value after reaching end of the path
  updatingObject[updatedPath[updatedPath.length - 1]] = value;

  return object;
}

/**
 * Helper to ensure a value cannot lead to a prototype pollution issue.
 *
 * @param value - The value to check
 * @return - If value is safe, returns it; otherwise returns undefined
 */
export const isKeyPrototypePollutionSafe = (value: PropertyPath): boolean => {
  if (typeof value === 'string') {
    return (
      value !== '__proto__' && value !== 'prototype' && value !== 'constructor'
    );
  }

  // An array is safe if all of its value are safe
  if (Array.isArray(value) && value.length > 0) {
    return (
      isKeyPrototypePollutionSafe(value[0]) &&
      isKeyPrototypePollutionSafe(value.splice(1))
    );
  }

  // If the value we are checking is not an array/object, we assume it to be safe
  return true;
};

export const determinePath = (path: PropertyPath): PropertyName[] => {
  return Array.isArray(path) ? path : path.toString().match(/[^.[\]]+/g) ?? [];
};
