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
  const updatedPath: string[] = Array.isArray(path)
    ? path.map((key) => key.toString())
    : path.toString().match(/[^.[\]]+/g) ?? [];

  if (
    // ensure that both the path and value will not lead to prototype pollution issues
    !updatedPath.reduce(
      (acc, curKey) => acc && isStringPrototypePollutionSafe(curKey),
      true
    ) ||
    !isValuePrototypePollutionSafe(value)
  ) {
    return object;
  }

  // let updatingObject = object;
  // for (let i = 0; i < updatedPath.length - 1; i++) {
  //   const key = updatedPath[i];
  //   if (updatingObject[key as keyof {}] && typeof updatingObject[key as keyof {}] === 'object') {
  //     updatingObject = updatingObject[key as keyof {}];
  //   } else {
  //     const nextKey = updatedPath[i + 1];
  //     updatingObject[key as keyof {}]  = []; // or {}
  //     updatingObject = updatingObject[key as keyof {}];
  //   }
  // }
  // // set value after reaching end of the path
  // updatingObject[updatedPath[updatedPath.length - 1] as keyof {}] = value;

  return object;
}

/**
 * Helper to ensure a value cannot lead to a prototype pollution issue.
 * Note that this is made with the specific use case of checking that some
 * value to be set inside an object is safe.
 *
 * @param value - The value to check
 * @return - If value is safe, returns it; otherwise returns undefined
 */
export const isValuePrototypePollutionSafe = (value: any): boolean => {
  // An array is safe if all of its value are safe
  if (Array.isArray(value) && value.length > 0) {
    return (
      isValuePrototypePollutionSafe(value[0]) &&
      isValuePrototypePollutionSafe(value.splice(1))
    );
  }

  // An object is safe if all of its values and keys are safe
  if (value && typeof value === 'object') {
    return (
      Object.keys(value).reduce(
        (acc, curKey) => acc && isStringPrototypePollutionSafe(curKey),
        true
      ) && isValuePrototypePollutionSafe(Object.values(value))
    );
  }

  // If the value we are checking is not an array/object, we assume it to be safe
  return true;
};

/**
 * Determines if the given string is prototype pollution safe. This assumes the context
 * that the string being passed in is a potential key for some object.
 */
const isStringPrototypePollutionSafe = (key: string) => {
  return key !== '__proto__' && key !== 'prototype' && key !== 'constructor';
};
