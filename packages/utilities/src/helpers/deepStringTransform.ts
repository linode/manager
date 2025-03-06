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
    return value.map((thisElement) => deepStringTransform(thisElement, fn));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce((acc, [key, _value]) => {
      return { ...acc, [key]: deepStringTransform(_value, fn) };
    }, {});
  }

  return value;
};
