import type { ExtendedType } from './extendType';

export const filterCurrentTypes = (types: ExtendedType[] = []) => {
  return types.filter((thisType) => !thisType.isDeprecated);
};
