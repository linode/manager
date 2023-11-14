import {
  CONTINENT_CODE_TO_CONTINENT,
  COUNTRY_CODE_TO_CONTINENT_CODE,
} from '@linode/api-v4';
import { Region } from '@linode/api-v4';

import type { Country } from '@linode/api-v4';

export const getRegionCountryGroup = (region: Region | undefined) => {
  if (!region) {
    return 'Other';
  }

  const continentCode =
    COUNTRY_CODE_TO_CONTINENT_CODE[region.country.toUpperCase() as Country];

  return continentCode
    ? CONTINENT_CODE_TO_CONTINENT[continentCode] ?? 'Other'
    : 'Other';
};

export const getSelectedRegion = (
  regions: Region[],
  selectedRegionId: string
): Region | undefined => {
  return regions.find((thisRegion) => selectedRegionId === thisRegion.id);
};

export const getSelectedRegionGroup = (
  regions: Region[],
  selectedRegionId: string
): string | undefined => {
  const selectedRegion = getSelectedRegion(regions, selectedRegionId);

  if (!selectedRegion) {
    return undefined;
  }

  return getRegionCountryGroup(selectedRegion);
};

export const isEURegion = (regionContinent: string | undefined): boolean => {
  return regionContinent === CONTINENT_CODE_TO_CONTINENT.EU;
};
