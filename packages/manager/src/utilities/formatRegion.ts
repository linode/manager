import {
  CONTINENT_CODE_TO_CONTINENT,
  COUNTRY_CODE_TO_CONTINENT_CODE,
} from '@linode/api-v4';
import { Region } from '@linode/api-v4';

import type { Agreements, Country, Profile } from '@linode/api-v4';

interface GDPRConfiguration {
  agreements?: Agreements;
  profile?: Profile;
  regions: Region[] | undefined;
  selectedRegionId: string;
}

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

/**
 *
 * @param opts.agreements The user's agreements
 * @param opts.profile The user's profile
 * @param opts.regions The list of regions
 * @param opts.selectedRegionId The ID of the selected region (e.g. 'eu-west')
 * @returns selectedRegionGroup: string | undefined - the group of the selected region, if it exists
 * @returns showGDPRCheckbox: boolean - whether or not to show the GDPR checkbox
 * @usage
 * const { selectedRegionGroup, showGDPRCheckbox } = getGDPRDetails({
 *  agreements,
 *  profile,
 *  regions,
 *  selectedRegionId,
 * });
 */
export const getGDPRDetails = ({
  agreements,
  profile,
  regions,
  selectedRegionId,
}: GDPRConfiguration): {
  selectedRegionGroup?: string;
  showGDPRCheckbox: boolean;
} => {
  if (regions === undefined) {
    return { selectedRegionGroup: undefined, showGDPRCheckbox: false };
  }

  const selectedRegionGroup = getSelectedRegionGroup(regions, selectedRegionId);

  const showGDPRCheckbox =
    Boolean(!profile?.restricted) &&
    Boolean(agreements?.eu_model) &&
    isEURegion(selectedRegionGroup);

  return { selectedRegionGroup, showGDPRCheckbox };
};
