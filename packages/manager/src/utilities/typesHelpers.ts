import { ExtendedType } from './extendType';

export const getTypeInfo = (type: null | string, types: ExtendedType[]) => {
  return types.find((thisType: ExtendedType) => {
    return type === thisType.id;
  });
};
