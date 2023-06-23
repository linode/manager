import { Region } from '@linode/api-v4';
import {
  CONTINENT_CODE_TO_CONTINENT,
  Country,
  COUNTRY_CODE_TO_CONTINENT_CODE,
} from 'src/components/EnhancedSelect/variants/RegionSelect/utils';

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

export const isEURegion = (region: string | null | undefined) =>
  region?.match('^eu');
