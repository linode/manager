import { getRegionAvailability } from '@linode/api-v4/lib/regions';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import { getNewRegionLabel } from 'src/components/RegionSelect/RegionSelect.utils';

import { queryPresets } from '../base';
import {
  getAllRegionAvailabilitiesRequest,
  getAllRegionsRequest,
} from './requests';

import type { Region, RegionAvailability } from '@linode/api-v4/lib/regions';
import type { APIError } from '@linode/api-v4/lib/types';

interface TransformRegionLabelOptions {
  includeSlug?: boolean;
  transformRegionLabel?: boolean;
}

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

export const useRegionsQuery = (
  options: Partial<TransformRegionLabelOptions> = {}
) =>
  useQuery<Region[], APIError[]>({
    ...regionQueries.regions,
    ...queryPresets.longLived,
    select: (regions: Region[]) => {
      // Display Country, City instead of City, State
      if (options.transformRegionLabel) {
        return regions.map((region) => ({
          ...region,
          label: getNewRegionLabel({
            includeSlug: options.includeSlug,
            region,
          }),
        }));
      }
      return regions;
    },
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
