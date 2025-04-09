import {
  GLOBAL_QUOTA_LABEL,
  GLOBAL_QUOTA_VALUE,
} from 'src/components/RegionSelect/constants';
import { regionSelectGlobalOption } from 'src/components/RegionSelect/constants';
import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';
import { useRegionsQuery } from 'src/queries/regions/regions';

import type {
  Filter,
  Quota,
  QuotaType,
  QuotaUsage,
  Region,
} from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';
import type { UseQueryResult } from '@tanstack/react-query';

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
    regions: [regionSelectGlobalOption, ...(regions ?? [])],
    s3Endpoints: null,
    service,
  };
};

interface GetQuotasFiltersProps {
  location: SelectOption<Quota['region_applied']> | null;
  service: SelectOption<QuotaType>;
}

/**
 * Function to get the filters for the quotas query
 */
export const getQuotasFilters = ({
  location,
  service,
}: GetQuotasFiltersProps): Filter => {
  return {
    region_applied:
      service.value !== 'object-storage' ? location?.value : undefined,
    s3_endpoint:
      service.value === 'object-storage' ? location?.value : undefined,
  };
};

/**
 * Function to get the error for a given quota usage query
 */
export const getQuotaError = (
  quotaUsageQueries: UseQueryResult<QuotaUsage, Error>[],
  index: number
) => {
  return Array.isArray(quotaUsageQueries[index].error) &&
    quotaUsageQueries[index].error[0]?.reason
    ? quotaUsageQueries[index].error[0].reason
    : 'An unexpected error occurred';
};
