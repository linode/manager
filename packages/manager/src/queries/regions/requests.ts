import { getRegionAvailabilities, getRegions } from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type { Region, RegionAvailability } from '@linode/api-v4';

// @TODO LKE-E: Remove useBetaEndpoint argument after LKE-5868 as it will no longer be needed.
export const getAllRegionsRequest = (useBetaEndpoint: boolean) =>
  getAll<Region>((params) => getRegions(params, useBetaEndpoint))().then(
    (data) => data.data
  );

export const getAllRegionAvailabilitiesRequest = () =>
  getAll<RegionAvailability>((params, filters) =>
    getRegionAvailabilities(params, filters)
  )().then((data) => data.data);
