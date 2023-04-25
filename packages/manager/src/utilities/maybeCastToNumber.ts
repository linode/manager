import { isNilOrEmpty } from './isNilOrEmpty';

export const maybeCastToNumber = (v: string | number) =>
  isNilOrEmpty(v) ? undefined : Number(v);
