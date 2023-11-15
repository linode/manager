import { CONTINENT_CODE_TO_CONTINENT } from '@linode/api-v4';

import {
  getRegionCountryGroup,
  getSelectedRegion,
} from 'src/utilities/formatRegion';

import type {
  GetRegionOptions,
  GetSelectedRegionById,
  RegionOptionAvailability,
  RegionSelectOption,
} from './RegionSelect.types';
import type { AccountAvailability, Region } from '@linode/api-v4';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

/**
 * Returns an array of OptionType objects for use in the RegionSelect component.
 * Regions are sorted alphabetically by region, with North America first.
 * We filter the regions through the account availability data to determine
 * which regions are available to the user.
 *
 * @returns {OptionType[]} An array of OptionType objects
 */
export const getRegionOptions = ({
  accountAvailabilityData,
  currentCapability,
  regions,
}: GetRegionOptions): RegionSelectOption[] => {
  return regions
    .map((region: Region) => {
      const group = getRegionCountryGroup(region);

      return {
        data: {
          country: region.country,
          region: group,
        },
        label: `${region.label} (${region.id})`,
        unavailable: getRegionOptionAvailability({
          accountAvailabilityData,
          currentCapability,
          region,
        }),
        value: region.id,
      };
    })
    .sort((region1, region2) => {
      // North America group comes first
      if (
        region1.data.region === NORTH_AMERICA &&
        region2.data.region !== NORTH_AMERICA
      ) {
        return -1;
      }
      if (
        region1.data.region !== NORTH_AMERICA &&
        region2.data.region === NORTH_AMERICA
      ) {
        return 1;
      }

      // Rest of the regions are sorted alphabetically
      if (region1.data.region < region2.data.region) {
        return -1;
      }
      if (region1.data.region > region2.data.region) {
        return 1;
      }

      // If regions are in the same group, sort alphabetically by label
      if (region1.label < region2.label) {
        return -1;
      }
      return 0;
    });
};

/**
 * Util to map a region ID to an OptionType object.
 *
 * @returns an OptionType object for the currently selected region.
 */
export const getSelectedRegionById = ({
  accountAvailabilityData,
  currentCapability,
  regions,
  selectedRegionId,
}: GetSelectedRegionById): RegionSelectOption | undefined => {
  const selectedRegion = getSelectedRegion(regions, selectedRegionId);

  if (!selectedRegion) {
    return undefined;
  }

  const group = getRegionCountryGroup(selectedRegion);

  return {
    data: {
      country: selectedRegion?.country,
      region: group,
    },
    label: `${selectedRegion.label} (${selectedRegion.id})`,
    unavailable: getRegionOptionAvailability({
      accountAvailabilityData,
      currentCapability,
      region: selectedRegion,
    }),
    value: selectedRegion.id,
  };
};

interface GetRegionOptionAvailability extends RegionOptionAvailability {
  region: Region;
}

const getRegionOptionAvailability = ({
  accountAvailabilityData,
  currentCapability,
  region,
}: GetRegionOptionAvailability): boolean => {
  if (!accountAvailabilityData) {
    return false;
  }

  const regionWithUnavailability:
    | AccountAvailability
    | undefined = accountAvailabilityData.find(
    (regionAvailability: AccountAvailability) =>
      regionAvailability.id === region.id
  );

  if (!regionWithUnavailability) {
    return false;
  }

  return regionWithUnavailability.unavailable.includes(currentCapability);
};
