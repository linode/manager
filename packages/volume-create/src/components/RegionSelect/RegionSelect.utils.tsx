import { CONTINENT_CODE_TO_CONTINENT } from "@linode/api-v4";

import { getRegionCountryGroup } from "src/utilities/formatRegion";

import type {
  GetRegionOptionAvailability,
  RegionFilterValue,
} from "./RegionSelect.types";
import type { AccountAvailability, Capabilities, Region } from "@linode/api-v4";

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

interface RegionSelectOptionsOptions {
  currentCapability: Capabilities | undefined;
  regionFilter?: RegionFilterValue;
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
      if (regionFilter) {
        const [, distributedContinentCode] = regionFilter.split("distributed-");
        // Filter distributed regions by geographical area
        if (distributedContinentCode && distributedContinentCode !== "ALL") {
          const group = getRegionCountryGroup(region);
          return (
            region.site_type === "distributed" &&
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

      // North America group comes first
      if (
        region1Group === "North America" &&
        region2Group !== "North America"
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
      if (region1.country === "us" || region2.country === "us") {
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

  const regionWithUnavailability: AccountAvailability | undefined =
    accountAvailabilityData.find(
      (regionAvailability: AccountAvailability) =>
        regionAvailability.region === region.id,
    );

  if (!regionWithUnavailability) {
    return false;
  }

  return regionWithUnavailability.unavailable.includes(currentCapability);
};

export const getNewRegionLabel = (region: Region) => {
  const [city] = region.label.split(", ");
  // Include state for the US
  if (region.country === "us") {
    return `${region.country.toUpperCase()}, ${region.label}`;
  }
  return `${region.country.toUpperCase()}, ${city}`;
};
