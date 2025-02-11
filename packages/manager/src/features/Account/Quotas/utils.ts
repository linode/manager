import { regionFactory } from 'src/factories';
import { useKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useQuotasQuery } from 'src/queries/quotas/quotas';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { Quota, QuotaType, Region } from '@linode/api-v4';

type UseGetLocationsForQuotaService = {
  isFetching: boolean;
} & (
  | {
      locationsForQuotaService: { label: string; value: string }[];
      objectStorageQuotas: Quota[];
      service: 'object-storage';
    }
  | {
      locationsForQuotaService: Region[];
      objectStorageQuotas: undefined;
      service: Exclude<QuotaType, 'object-storage'>;
    }
);

/**
 * Function to get either:
 * - The region(s) for a given quota service (linode, lke, ...)
 * - The s3 endpoint(s) (object-storage)
 */
export const useGetLocationsForQuotaService = (
  service: QuotaType
): UseGetLocationsForQuotaService => {
  const { data: regions, isFetching: isFetchingRegions } = useRegionsQuery();
  const { data: linodes, isFetching: isFetchingLinodes } = useLinodesQuery();
  const {
    data: clusters,
    isFetching: isFetchingClusters,
  } = useKubernetesClustersQuery({}, {});
  const { data: objectStorageQuotas } = useQuotasQuery(
    service,
    {},
    {},
    service === 'object-storage'
  );

  const globalOption = regionFactory.build({
    capabilities: [],
    id: 'global',
    label: 'Global (Account level)',
  });

  if (service === 'object-storage') {
    const uniqueEndpoints = Array.from(
      (objectStorageQuotas?.data ?? [])
        .reduce((map, quota) => {
          const key = `${quota.s3_endpoint}-${quota.endpoint_type}`;
          if (!map.has(key) && quota.s3_endpoint) {
            map.set(key, {
              endpoint: quota.s3_endpoint,
              endpoint_type: quota.endpoint_type,
            });
          }
          return map;
        }, new Map<string, { endpoint: string; endpoint_type: string }>())
        .values()
    );

    return {
      isFetching: isFetchingRegions,
      locationsForQuotaService: [
        ...(uniqueEndpoints.length >= 2
          ? [{ label: 'Global (Account level)', value: 'global' }]
          : []),
        ...uniqueEndpoints.map((endpoint) => ({
          label: `${endpoint.endpoint} (Standard ${endpoint.endpoint_type})`,
          value: endpoint.endpoint,
        })),
      ],
      objectStorageQuotas: objectStorageQuotas?.data ?? [],
      service: 'object-storage',
    };
  }

  if (service === 'linode') {
    const linodeRegions = linodes?.data.map((linode) => linode.region);
    return {
      isFetching: isFetchingRegions || isFetchingLinodes,
      locationsForQuotaService: [
        globalOption,
        ...(regions?.filter((region) => linodeRegions?.includes(region.id)) ??
          []),
      ],
      objectStorageQuotas: undefined,
      service,
    };
  }

  if (service === 'lke') {
    const clusterRegions = clusters?.data.map((cluster) => cluster.region);
    return {
      isFetching: isFetchingRegions || isFetchingClusters,
      locationsForQuotaService: [
        globalOption,
        ...(regions?.filter((region) => clusterRegions?.includes(region.id)) ??
          []),
      ],
      objectStorageQuotas: undefined,
      service,
    };
  }

  return {
    isFetching: isFetchingRegions,
    locationsForQuotaService: [globalOption, ...(regions ?? [])],
    objectStorageQuotas: undefined,
    service,
  };
};
