// Given a value of any type and a string transformation function, apply the
// function to the value recursively. Useful for redacting string patterns.
export const deepStringTransform = (
  value: any,
  fn: (s: string) => string
): any => {
  if (typeof value === 'string') {
    return fn(value);
  }

  if (Array.isArray(value)) {
    return value.map(thisElement => deepStringTransform(thisElement, fn));
  }

  if (typeof value === 'object' && value !== null) {
    const transformed = {};
    Object.keys(value).forEach(key => {
      transformed[key] = deepStringTransform(value[key], fn);
    });
    return transformed;
  }

  return value;
};

export default deepStringTransform;
