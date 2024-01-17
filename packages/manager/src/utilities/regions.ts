import { Region } from '@linode/api-v4/lib/regions';

export const getRegionsByRegionId = (regionsData: Region[] | undefined) => {
  if (!Array.isArray(regionsData)) {
    return {};
  }
  return regionsData.reduce((lookup, region) => {
    lookup[region.id] = region;
    return lookup;
  }, {});
};
