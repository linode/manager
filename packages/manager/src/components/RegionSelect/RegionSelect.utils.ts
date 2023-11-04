import { getRegionCountryGroup } from 'src/utilities/formatRegion';

import { CONTINENT_CODE_TO_CONTINENT } from './RegionSelect.constants';
import { listOfDisabledRegions } from './disabledRegions';

import type { OptionType } from './RegionSelect.types';
import type { FakeRegion } from './disabledRegions';
import type { Region } from '@linode/api-v4';
import type { FlagSet } from 'src/featureFlags';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

export const getRegionOptions = (
  regions: Region[],
  flags: FlagSet,
  path: string
) => {
  const allRegions = [
    ...regions,
    ...listOfDisabledRegions
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
          disabledMessage: (region as FakeRegion).disabledMessage || null,
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

      // Everything else is sorted alphabetically by region
      if (region1.data.region < region2.data.region) {
        return -1;
      }
      if (region1.data.region > region2.data.region) {
        return 1;
      }
      return 0;
    });
};

export const getSelectedRegionById = (
  regions: Region[],
  selectedRegionId: string
): OptionType | undefined => {
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
      region: group,
    },
    label: `${selectedRegion.label} (${selectedRegion.id})`,
    value: selectedRegion.id,
  };
};
