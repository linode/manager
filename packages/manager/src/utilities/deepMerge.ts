const isObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merge two objects.
 *
 * @param target Object to merge into
 * @param source Object to merge from
 * @returns Merged object
 */

export const deepMerge = (target: any, source: any) => {
  if (Array.isArray(source)) {
    return [...source];
  }

  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};
