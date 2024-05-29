import {
  Region,
  RegionAvailability,
  getRegionAvailability,
} from '@linode/api-v4/lib/regions';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import { queryPresets } from '../base';
import {
  getAllRegionAvailabilitiesRequest,
  getAllRegionsRequest,
} from './requests';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export const regionQueries = createQueryKeys('regions', {
  availability: {
    contextQueries: {
      all: {
        queryFn: getAllRegionAvailabilitiesRequest,
        queryKey: null,
      },
      region: (regionId: string) => ({
        queryFn: () => getRegionAvailability(regionId),
        queryKey: [regionId],
      }),
    },
    queryKey: null,
  },
  regions: {
    queryFn: getAllRegionsRequest,
    queryKey: null,
  },
});

export const useRegionsQuery = () =>
  useQuery<Region[], FormattedAPIError[]>({
    ...regionQueries.regions,
    ...queryPresets.longLived,
  });

export const useRegionsAvailabilitiesQuery = (enabled: boolean = true) =>
  useQuery<RegionAvailability[], FormattedAPIError[]>({
    ...regionQueries.availability._ctx.all,
    enabled,
  });

export const useRegionAvailabilityQuery = (
  regionId: string,
  enabled: boolean = true
) => {
  return useQuery<RegionAvailability[], FormattedAPIError[]>({
    ...regionQueries.availability._ctx.region(regionId),
    enabled,
  });
};
