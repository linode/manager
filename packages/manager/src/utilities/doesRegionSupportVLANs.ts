import { Region } from '@linode/api-v4/lib/regions';
import { ExtendedRegion } from 'src/queries/regions';

export const doesRegionSupportVLANs = (
  region: string,
  regionsData: Region[]
) => {
  const regionMetaData = regionsData.find((thisRegion) => {
    return thisRegion.id === region;
  });
  if (!regionMetaData) {
    return false;
  }
  return regionMetaData.capabilities.includes('Vlans');
};

export const regionsWithVLANs = (regionsData: Region[] | ExtendedRegion[]) => {
  return regionsData.filter((region) => region.capabilities.includes('Vlans'));
};
