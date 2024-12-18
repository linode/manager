import { getRegionAvailabilities, getRegions } from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type { Region, RegionAvailability } from '@linode/api-v4';

export const getAllRegionsRequest = () =>
  getAll<Region>((params) => getRegions(params))().then((data) => data.data);

export const getAllRegionAvailabilitiesRequest = () =>
  getAll<RegionAvailability>((params, filters) =>
    getRegionAvailabilities(params, filters)
  )().then((data) => data.data);
