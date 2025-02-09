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
      locationsForQuotaService: { id: string; label: string }[];
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
    return {
      isFetching: isFetchingRegions,
      locationsForQuotaService: [
        globalOption,
        ...(objectStorageQuotas?.data.map((quota) => ({
          id: quota.s3_endpoint ?? '',
          label: `${quota.s3_endpoint} (Standard ${quota.endpoint_type})`,
        })) ?? []),
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
