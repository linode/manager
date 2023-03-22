import { ExtendedType } from './extendType';

export const getTypeInfo = (type: string | null, types: ExtendedType[]) => {
  return types.find((thisType: ExtendedType) => {
    return type === thisType.id;
  });
};
