import { getRegion, getRegionAvailability } from "@linode/api-v4/lib/regions";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

import { getNewRegionLabel } from "src/components/RegionSelect/RegionSelect.utils";

import { queryPresets } from "../base";
import {
  getAllRegionAvailabilitiesRequest,
  getAllRegionsRequest,
} from "./requests";

import type { Region, RegionAvailability } from "@linode/api-v4/lib/regions";
import type { APIError } from "@linode/api-v4/lib/types";

const regionQueries = createQueryKeys("regions", {
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

const useRegionQuery = (regionId: string) => {
  return useQuery<Region, APIError>({
    ...regionQueries.region(regionId),
    enabled: Boolean(regionId),
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

const useRegionsAvailabilitiesQuery = (enabled: boolean = true) =>
  useQuery<RegionAvailability[], APIError[]>({
    ...regionQueries.availability._ctx.all,
    enabled,
  });

const useRegionAvailabilityQuery = (
  regionId: string,
  enabled: boolean = true,
) => {
  return useQuery<RegionAvailability[], APIError[]>({
    ...regionQueries.availability._ctx.region(regionId),
    enabled,
  });
};
