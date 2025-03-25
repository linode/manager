export const isNilOrEmpty = (v: null | number | object | string | undefined) =>
  v === null ||
  v === undefined ||
  v === '' ||
  (typeof v === 'object' &&
    (v instanceof Set || v instanceof Map
      ? v.size === 0
      : Object.keys(v || {}).length === 0));
