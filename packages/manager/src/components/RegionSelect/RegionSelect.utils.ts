import { CONTINENT_CODE_TO_CONTINENT } from '@linode/api-v4';

import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { listOfFakeRegions } from './disabledRegions';

import type { RegionSelectOption } from './RegionSelect.types';
import type { FakeRegion } from './disabledRegions';
import type { Region } from '@linode/api-v4';
import type { FlagSet } from 'src/featureFlags';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

/**
 * Returns an array of OptionType objects for use in the RegionSelect component.
 * Regions are sorted alphabetically by region, with North America first.
 * Includes fake regions if they are enabled by a feature flag.
 * Fake regions only appear in the list if they are not already included in the
 * /regions response, and if they are not excluded by the current path.
 *
 * @returns {OptionType[]} An array of OptionType objects
 */
export const getRegionOptions = (
  regions: Region[],
  flags: FlagSet,
  path: string
) => {
  const allRegions = [
    ...regions,
    ...listOfFakeRegions
      .filter((disabledRegion) => {
        /**
         * Only display a fake region if the feature flag for it is enabled
         */
        const isFlagEnabled = flags[disabledRegion.featureFlag];
        /**
         * Don't display a fake region if it's included in the real /regions response
         */
        const isAlreadyIncluded = regions.some(
          (region) => region.id === disabledRegion.fakeRegion.id
        );
        /**
         * Don't display a fake region if it's excluded by the current path
         */
        const isExcludedByPath = disabledRegion.excludePaths?.some(
          (pathToExclude) => path.includes(pathToExclude)
        );

        return isFlagEnabled && !isAlreadyIncluded && !isExcludedByPath;
      })
      .map((disabledRegion) => disabledRegion.fakeRegion),
  ];

  return allRegions
    .map((region: Region) => {
      const group = getRegionCountryGroup(region);

      return {
        data: {
          country: region.country,
          disabledMessage: (region as FakeRegion).disabledMessage,
          region: group,
        },
        label: `${region.label} (${region.id})`,
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
export const getSelectedRegionById = (
  regions: Region[],
  selectedRegionId: string
): RegionSelectOption | undefined => {
  const selectedRegion: Region | undefined = regions.find(
    (thisRegion) => selectedRegionId === thisRegion.id
  );

  const group = getRegionCountryGroup(selectedRegion);

  if (!selectedRegion) {
    return undefined;
  }

  return {
    data: {
      country: selectedRegion?.country,
      disabledMessage: null,
      region: group,
    },
    label: `${selectedRegion.label} (${selectedRegion.id})`,
    value: selectedRegion.id,
  };
};
