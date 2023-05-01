import { Region } from '@linode/api-v4';
import {
  COUNTRY_CODE_TO_CONTINENT_CODE,
  CONTINENT_CODE_TO_CONTINENT,
} from 'src/components/EnhancedSelect/variants/RegionSelect/utils';

export const getRegionCountryGroup = (region: Region | undefined) => {
  if (!region) {
    return 'Other';
  }

  const continentCode =
    COUNTRY_CODE_TO_CONTINENT_CODE[
      region.country.toUpperCase() as keyof typeof COUNTRY_CODE_TO_CONTINENT_CODE
    ];

  return continentCode
    ? CONTINENT_CODE_TO_CONTINENT[continentCode] ?? 'Other'
    : 'Other';
};

export const isEURegion = (region: string | null | undefined) =>
  region?.match('^eu');
