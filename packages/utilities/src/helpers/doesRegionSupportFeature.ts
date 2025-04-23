import { Capabilities, Region } from '@linode/api-v4/lib/regions';

export const doesRegionSupportFeature = (
  region: string,
  regionsData: Region[],
  feature: Capabilities
) => {
  const regionMetaData = regionsData.find((thisRegion) => {
    return thisRegion.id === region;
  });
  if (!regionMetaData) {
    return false;
  }
  return regionMetaData.capabilities.includes(feature);
};

export const regionsWithFeature = (
  regionsData: Region[],
  feature: Capabilities
) => {
  return regionsData.filter((region) => region.capabilities.includes(feature));
};
