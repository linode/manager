import {
  CONTINENT_CODE_TO_CONTINENT,
  Capabilities,
  RegionSite,
} from '@linode/api-v4';

import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import type {
  GetRegionOptionAvailability,
  SupportedDistributedRegionTypes,
} from './RegionSelect.types';
import type { AccountAvailability, Region } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

interface RegionSelectOptionsOptions {
  currentCapability: Capabilities | undefined;
  regionFilter?: RegionSite;
  regions: Region[];
}

export const getRegionOptions = ({
  currentCapability,
  regionFilter,
  regions,
}: RegionSelectOptionsOptions) => {
  return regions
    .filter((region) => {
      if (
        currentCapability &&
        !region.capabilities.includes(currentCapability)
      ) {
        return false;
      }
      if (regionFilter && region.site_type !== regionFilter) {
        return false;
      }
      return true;
    })
    .sort((region1, region2) => {
      const region1Group = getRegionCountryGroup(region1);
      const region2Group = getRegionCountryGroup(region2);

      // North America group comes first
      if (
        region1Group === 'North America' &&
        region2Group !== 'North America'
      ) {
        return -1;
      }
      if (region1Group !== NORTH_AMERICA && region2Group === NORTH_AMERICA) {
        return 1;
      }

      // Rest of the regions are sorted alphabetically
      if (region1Group < region2Group) {
        return -1;
      }
      if (region1Group > region2Group) {
        return 1;
      }

      // Then we group by country
      if (region1.country < region2.country) {
        return 1;
      }
      if (region1.country > region2.country) {
        return -1;
      }

      // If regions are in the same group or country, sort alphabetically by label
      if (region1.label < region2.label) {
        return -1;
      }

      return 1;
    });
};

/**
 * Util to determine if a region is available to the user for a given capability.
 *
 * @returns a boolean indicating whether the region is available to the user.
 */
export const isRegionOptionUnavailable = ({
  accountAvailabilityData,
  currentCapability,
  region,
}: GetRegionOptionAvailability): boolean => {
  if (!accountAvailabilityData || !currentCapability) {
    return false;
  }

  const regionWithUnavailability:
    | AccountAvailability
    | undefined = accountAvailabilityData.find(
    (regionAvailability: AccountAvailability) =>
      regionAvailability.region === region.id
  );

  if (!regionWithUnavailability) {
    return false;
  }

  return regionWithUnavailability.unavailable.includes(currentCapability);
};

/**
 * Util to determine whether a create type has support for distributed regions.
 *
 * @returns a boolean indicating whether or not the create type supports distributed regions.
 */
export const isDistributedRegionSupported = (createType: LinodeCreateType) => {
  const supportedDistributedRegionTypes: SupportedDistributedRegionTypes[] = [
    'Distributions',
    'StackScripts',
  ];
  return (
    supportedDistributedRegionTypes.includes(
      createType as SupportedDistributedRegionTypes
    ) || typeof createType === 'undefined' // /linodes/create route
  );
};

/**
 * Util to determine whether a selected region is a distributed region.
 *
 * @returns a boolean indicating whether or not the selected region is a distributed region.
 */
export const getIsDistributedRegion = (
  regionsData: Region[],
  selectedRegion: string
) => {
  const region = regionsData.find(
    (region) => region.id === selectedRegion || region.label === selectedRegion
  );
  return region?.site_type === 'distributed' || region?.site_type === 'edge';
};
