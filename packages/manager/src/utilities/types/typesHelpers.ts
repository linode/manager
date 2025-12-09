import type { ExtendedType } from '../extendType';

export const getTypeInfo = (type: null | string, types: ExtendedType[]) => {
  return types.find((thisType: ExtendedType) => {
    return type === thisType.id;
  });
};

// Utility type to enforce at least one of `clusters` or `regions` to be provided.
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];
