// Creates a new object with the own properties of the first object merged
// with the own properties of the second object. If a key exists in both objects: and both values are objects,
// the two values will be recursively merged otherwise the value from the second object will be used.
export const mergeDeepRight = <
  T extends Record<string, any>,
  U extends Record<string, any>
>(
  obj1: T,
  obj2: U
): T & U => {
  if (!isObject(obj2)) {
    if (!obj2) {
      return obj1 as T & U;
    } else {
      return obj2 as T & U;
    }
  }
  if (!isObject(obj1)) {
    if (!obj1) {
      return obj2 as T & U;
    } else {
      return obj1 as T & U;
    }
  }

  return Object.keys({ ...obj1, ...obj2 }).reduce((acc: any, key: string) => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    acc[key] = mergeDeepRight(val1, val2);
    return acc;
  }, {} as T & U);
};

// using a custom function to check for an object since typescript classifies arrays, dates and maps as type 'object'
const isObject = (obj: object) =>
  Object.prototype.toString.call(obj) === '[object Object]';
