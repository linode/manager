import { isEmpty, isNil } from 'ramda';

export const isNilOrEmpty = (v: any) => isNil(v) || isEmpty(v);
