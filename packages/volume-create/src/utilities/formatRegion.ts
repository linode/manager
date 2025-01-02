import {
  CONTINENT_CODE_TO_CONTINENT,
  COUNTRY_CODE_TO_CONTINENT_CODE,
} from "@linode/api-v4";

import type { Country } from "@linode/api-v4";
import type { Region } from "@linode/api-v4";

export const getRegionCountryGroup = (region: Region | undefined) => {
  if (!region) {
    return "Other";
  }

  const continentCode =
    COUNTRY_CODE_TO_CONTINENT_CODE[
      region.country.toUpperCase() as Uppercase<Country>
    ];

  return continentCode
    ? (CONTINENT_CODE_TO_CONTINENT[continentCode] ?? "Other")
    : "Other";
};
