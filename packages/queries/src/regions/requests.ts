import {
  getRegionAvailabilities,
  getRegions,
  getRegionsVPCAvailabilities,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Region,
  RegionAvailability,
  RegionVPCAvailability,
} from '@linode/api-v4';

export const getAllRegionsRequest = () =>
  getAll<Region>((params) => getRegions(params))().then((data) => data.data);

export const getAllRegionAvailabilitiesRequest = () =>
  getAll<RegionAvailability>((params, filters) =>
    getRegionAvailabilities(params, filters),
  )().then((data) => data.data);

export const getAllRegionVPCAvailabilitiesRequest = () =>
  getAll<RegionVPCAvailability>((params, filters) =>
    getRegionsVPCAvailabilities(params, filters),
  )().then((data) => data.data);
