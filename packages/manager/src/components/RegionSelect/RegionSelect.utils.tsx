import { CONTINENT_CODE_TO_CONTINENT } from '@linode/api-v4';
import { useRegionsQuery } from '@linode/queries';

// @todo: modularization - Move `getRegionCountryGroup` utility to `@linode/shared` package
// as it imports GLOBAL_QUOTA_VALUE from RegionSelect's constants.ts and update the import.
import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import type {
  GetRegionOptionAvailability,
  RegionFilterValue,
} from './RegionSelect.types';
import type { AccountAvailability, Capabilities, Region } from '@linode/api-v4';
import type { LinodeCreateType } from '@linode/utilities';
// @todo: modularization - Update type FlagSet to import from `@linode/shared` package once available.
import type { FlagSet } from 'src/featureFlags';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

interface RegionSelectOptions {
  currentCapability: Capabilities | undefined;
  forcefullyShownRegionIds?: Set<string>;
  regionFilter?: RegionFilterValue;
  regions: Region[];
}

export const getRegionOptions = ({
  currentCapability,
  forcefullyShownRegionIds,
  regionFilter,
  regions,
}: RegionSelectOptions) => {
  return regions
    .filter((region) => {
      if (forcefullyShownRegionIds?.has(region.id)) {
        return true;
      }

      if (
        currentCapability &&
        !region.capabilities.includes(currentCapability)
      ) {
        return false;
      }
      if (regionFilter) {
        const [, distributedContinentCode] = regionFilter.split('distributed-');
        // Filter distributed regions by geographical area
        if (distributedContinentCode && distributedContinentCode !== 'ALL') {
          const group = getRegionCountryGroup(region);
          return (
            region.site_type === 'distributed' &&
            CONTINENT_CODE_TO_CONTINENT[
              distributedContinentCode as keyof typeof CONTINENT_CODE_TO_CONTINENT
            ] === group
          );
        }
        return regionFilter.includes(region.site_type);
      }
      return true;
    })
    .sort((region1, region2) => {
      const region1Group = getRegionCountryGroup(region1);
      const region2Group = getRegionCountryGroup(region2);

      // Global group comes first
      if (region1Group === 'global') {
        return -1;
      }
      if (region2Group === 'global') {
        return 1;
      }

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

      // Group US first
      if (region1.country === 'us' || region2.country === 'us') {
        if (region1.country < region2.country) {
          return 1;
        }
        if (region1.country > region2.country) {
          return -1;
        }
      }

      // Then we group by label
      if (region1.label < region2.label) {
        return -1;
      }
      if (region1.label > region2.label) {
        return 1;
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
  const supportedDistributedRegionTypes = [
    'OS',
    'Images',
    undefined, // /linodes/create route
  ];
  return supportedDistributedRegionTypes.includes(createType);
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
  return region?.site_type === 'distributed';
};

export const useIsGeckoEnabled = (flags: FlagSet) => {
  const { data: regions } = useRegionsQuery();

  const isGeckoLA = flags?.gecko2?.enabled && flags.gecko2.la;
  const isGeckoBeta = flags?.gecko2?.enabled && !flags.gecko2?.la;

  const hasDistributedRegionCapability = regions?.some((region: Region) =>
    region.capabilities.includes('Distributed Plans')
  );
  const isGeckoLAEnabled = Boolean(hasDistributedRegionCapability && isGeckoLA);
  const isGeckoBetaEnabled = Boolean(
    hasDistributedRegionCapability && isGeckoBeta
  );

  return { isGeckoBetaEnabled, isGeckoLAEnabled };
};
