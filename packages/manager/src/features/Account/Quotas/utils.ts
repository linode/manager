import { regionFactory } from 'src/factories';
import { useQuotasQuery } from 'src/queries/quotas/quotas';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type { QuotaType, Region } from '@linode/api-v4';

type UseGetLocationsForQuotaService =
  | {
      isFetchingObjectStorageQuotas: boolean;
      regions: null;
      s3Endpoints: { label: string; value: string }[];
      service: 'object-storage';
    }
  | {
      isFetchingRegions: boolean;
      regions: Region[];
      s3Endpoints: null;
      service: Exclude<QuotaType, 'object-storage'>;
    };

/**
 * Function to get either:
 * - The region(s) for a given quota service (linode, lke, ...)
 * - The s3 endpoint(s) (object-storage)
 */
export const useGetLocationsForQuotaService = (
  service: QuotaType
): UseGetLocationsForQuotaService => {
  const { data: regions, isFetching: isFetchingRegions } = useRegionsQuery();
  const {
    data: quotas,
    isFetching: isFetchingObjectStorageQuotas,
  } = useQuotasQuery(service, {}, {}, service === 'object-storage');

  const globalOption = regionFactory.build({
    capabilities: [],
    id: 'global',
    label: 'Global (Account level)',
  });

  if (service === 'object-storage') {
    const uniqueEndpoints = Array.from(
      (quotas?.data ?? [])
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
      isFetchingObjectStorageQuotas,
      regions: null,
      s3Endpoints: [
        ...[{ label: 'Global (Account level)', value: 'global' }],
        ...uniqueEndpoints.map((endpoint) => ({
          label: `${endpoint.endpoint} (Standard ${endpoint.endpoint_type})`,
          value: endpoint.endpoint,
        })),
      ],
      service: 'object-storage',
    };
  }

  return {
    isFetchingRegions,
    regions: [globalOption, ...(regions ?? [])],
    s3Endpoints: null,
    service,
  };
};
