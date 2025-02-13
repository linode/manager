import { regionFactory } from 'src/factories';
import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';
import { useRegionsQuery } from 'src/queries/regions/regions';

import { GLOBAL_QUOTA_LABEL, GLOBAL_QUOTA_VALUE } from './constants';

import type { QuotaType, Region } from '@linode/api-v4';

type UseGetLocationsForQuotaService =
  | {
      isFetchingRegions: boolean;
      regions: Region[];
      s3Endpoints: null;
      service: Exclude<QuotaType, 'object-storage'>;
    }
  | {
      isFetchingS3Endpoints: boolean;
      regions: null;
      s3Endpoints: { label: string; value: string }[];
      service: Extract<QuotaType, 'object-storage'>;
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
  // In order to get the s3 endpoints, we need to query the object storage service
  // It will only show quotas for assigned endpoints (endpoints relevant to a region a user ever created a resource in).
  const {
    data: s3Endpoints,
    isFetching: isFetchingS3Endpoints,
  } = useObjectStorageEndpoints(service === 'object-storage');

  const globalOption = regionFactory.build({
    capabilities: [],
    id: GLOBAL_QUOTA_VALUE,
    label: GLOBAL_QUOTA_LABEL,
  });

  if (service === 'object-storage') {
    return {
      isFetchingS3Endpoints,
      regions: null,
      s3Endpoints: [
        ...[{ label: GLOBAL_QUOTA_LABEL, value: GLOBAL_QUOTA_VALUE }],
        ...(s3Endpoints ?? [])
          ?.map((s3Endpoint) => {
            if (!s3Endpoint.s3_endpoint) {
              return null;
            }

            return {
              label: `${s3Endpoint.s3_endpoint} (Standard ${s3Endpoint.endpoint_type})`,
              value: s3Endpoint.s3_endpoint,
            };
          })
          .filter((item) => item !== null),
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
