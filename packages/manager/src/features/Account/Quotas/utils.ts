import { regionFactory } from 'src/factories';
import { useKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { QuotaType, Region } from '@linode/api-v4';

interface UseGetRegionsForQuotaService {
  isFetching: boolean;
  regionsForQuotaService: Region[];
}

export const useGetRegionsForQuotaService = (
  service: QuotaType
): UseGetRegionsForQuotaService => {
  const { data: regions, isFetching: isFetchingRegions } = useRegionsQuery();
  const { data: linodes, isFetching: isFetchingLinodes } = useLinodesQuery();
  const {
    data: clusters,
    isFetching: isFetchingClusters,
  } = useKubernetesClustersQuery({}, {});
  const {
    data: buckets,
    isFetching: isFetchingBuckets,
  } = useObjectStorageBuckets();
  const globalOption = regionFactory.build({
    capabilities: [],
    id: 'global',
    label: 'Global (Account level)',
  });

  if (service === 'linode') {
    const linodeRegions = linodes?.data.map((linode) => linode.region);
    return {
      isFetching: isFetchingRegions || isFetchingLinodes,
      regionsForQuotaService: [
        globalOption,
        ...(regions?.filter((region) => linodeRegions?.includes(region.id)) ??
          []),
      ],
    };
  }

  if (service === 'lke') {
    const clusterRegions = clusters?.data.map((cluster) => cluster.region);
    return {
      isFetching: isFetchingRegions || isFetchingClusters,
      regionsForQuotaService: [
        globalOption,
        ...(regions?.filter((region) => clusterRegions?.includes(region.id)) ??
          []),
      ],
    };
  }

  if (service === 'object-storage') {
    const bucketRegions = buckets?.buckets.map((bucket) => bucket.region);
    return {
      isFetching: isFetchingRegions || isFetchingBuckets,
      regionsForQuotaService: [
        globalOption,
        ...(regions?.filter((region) => bucketRegions?.includes(region.id)) ??
          []),
      ],
    };
  }

  return {
    isFetching: isFetchingRegions,
    regionsForQuotaService: [globalOption, ...(regions ?? [])],
  };
};
