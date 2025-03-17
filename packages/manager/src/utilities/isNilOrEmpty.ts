export const isNilOrEmpty = (v: null | number | object | string | undefined) =>
  v == null || // covers for null and undefined
  v === '' ||
  (typeof v === 'object' && Object.keys(v || {}).length === 0);
