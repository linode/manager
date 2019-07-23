import { regionsWithoutBlockStorage } from 'src/constants';

export const doesRegionSupportBlockStorage = (region: string) => {
  return !regionsWithoutBlockStorage.includes(region);
};
