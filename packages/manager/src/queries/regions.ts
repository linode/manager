import {
  Region,
  RegionAvailability,
  getRegionAvailabilities,
  getRegionAvailability,
  getRegions,
} from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from '@tanstack/react-query';

import data from 'src/cachedData/regions.json';
import { getAll } from 'src/utilities/getAll';

import { queryPresets } from './base';

const cachedData = data.data as Region[];
const queryKey = 'region-availability';

export const useRegionsQuery = () =>
  useQuery<Region[], APIError[]>('regions', getAllRegionsRequest, {
    ...queryPresets.longLived,
    placeholderData: cachedData,
  });

const getAllRegionsRequest = () =>
  getAll<Region>((params) => getRegions(params))().then((data) => data.data);

// Region Availability queries

export const useRegionsAvailabilitiesQuery = () =>
  useQuery<RegionAvailability[], APIError[]>(
    queryKey,
    getAllRegionAvailabilitiesRequest
  );

const getAllRegionAvailabilitiesRequest = () =>
  getAll<RegionAvailability>((params, filters) =>
    getRegionAvailabilities(params, filters)
  )().then((data) => data.data);

export const useRegionsAvailabilityQuery = (
  id: string,
  enabled: boolean = true
) => {
  return useQuery<RegionAvailability[], APIError[]>(
    [queryKey, 'regionAvailability', id],
    () => getRegionAvailability(id),
    {
      enabled,
    }
  );
};
