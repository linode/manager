import { getRegion, getRegionAvailability } from "@linode/api-v4/lib/regions";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { useQuery } from "@tanstack/react-query";

import { getNewRegionLabel } from "src/components/RegionSelect/RegionSelect.utils";

import { queryPresets } from "../base";
import {
  getAllRegionAvailabilitiesRequest,
  getAllRegionsRequest,
} from "./requests";

import type { Region } from "@linode/api-v4/lib/regions";
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
