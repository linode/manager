import { ExtendedType } from 'src/queries/types';

export const filterCurrentTypes = (types: ExtendedType[] = []) => {
  return types.filter((thisType) => !thisType.isDeprecated);
};
