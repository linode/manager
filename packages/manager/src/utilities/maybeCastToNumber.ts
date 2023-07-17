import { isNilOrEmpty } from './isNilOrEmpty';

export const maybeCastToNumber = (v: number | string) =>
  isNilOrEmpty(v) ? undefined : Number(v);
