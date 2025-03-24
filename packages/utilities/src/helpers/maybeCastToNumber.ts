import { isNilOrEmpty } from '@linode/utilities';

export const maybeCastToNumber = (v: number | string) =>
  isNilOrEmpty(v) ? undefined : Number(v);
