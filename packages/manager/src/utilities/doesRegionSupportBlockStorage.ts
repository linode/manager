import { Region } from '@linode/api-v4/lib/regions';

export const doesRegionSupportBlockStorage = (
  region: string,
  regionsData: Region[]
) => {
  const regionMetaData = regionsData.find((thisRegion) => {
    return thisRegion.id === region;
  });
  if (!regionMetaData) {
    return false;
  }
  return regionMetaData.capabilities.includes('Block Storage');
};
