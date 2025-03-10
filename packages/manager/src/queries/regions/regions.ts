import { getRegion, getRegionAvailability } from '@linode/api-v4/lib/regions';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { getNewRegionLabel } from 'src/components/RegionSelect/RegionSelect.utils';

import { queryPresets } from '../base';
import {
  getAllRegionAvailabilitiesRequest,
  getAllRegionsRequest,
} from './requests';

import type { Region, RegionAvailability } from '@linode/api-v4/lib/regions';
import type { APIError } from '@linode/api-v4/lib/types';

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
  region: (regionId: string) => ({
    queryFn: () => getRegion(regionId),
    queryKey: [regionId],
  }),
  regions: {
    queryFn: getAllRegionsRequest,
    queryKey: null,
  },
});

export const useRegionQuery = (regionId: string) => {
  const queryClient = useQueryClient();
  return useQuery<Region, APIError>({
    ...regionQueries.region(regionId),
    enabled: Boolean(regionId),
    initialData() {
      const regions = queryClient.getQueryData(
        queryOptions(regionQueries.regions).queryKey
      );
      return regions?.find((r) => r.id === regionId);
    },
    select: (region) => ({
      ...region,
      label: getNewRegionLabel(region),
    }),
  });
};

export const useRegionsQuery = () =>
  useQuery<Region[], APIError[]>({
    ...regionQueries.regions,
    ...queryPresets.longLived,
    select: (regions: Region[]) =>
      regions.map((region) => ({
        ...region,
        label: getNewRegionLabel(region),
      })),
  });

export const useRegionsAvailabilitiesQuery = (enabled: boolean = true) =>
  useQuery<RegionAvailability[], APIError[]>({
    ...regionQueries.availability._ctx.all,
    enabled,
  });

export const useRegionAvailabilityQuery = (
  regionId: string,
  enabled: boolean = true
) => {
  return useQuery<RegionAvailability[], APIError[]>({
    ...regionQueries.availability._ctx.region(regionId),
    enabled,
  });
};
