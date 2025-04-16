import { useRegionsQuery } from '@linode/queries';
import { object, string } from 'yup';

import {
  GLOBAL_QUOTA_LABEL,
  GLOBAL_QUOTA_VALUE,
  regionSelectGlobalOption,
} from 'src/components/RegionSelect/constants';
import { useObjectStorageEndpoints } from 'src/queries/object-storage/queries';

import type { QuotaIncreaseFormFields } from './QuotasIncreaseForm';
import type {
  Filter,
  Profile,
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
  const { data: s3Endpoints, isFetching: isFetchingS3Endpoints } =
    useObjectStorageEndpoints(service === 'object-storage');

  if (service === 'object-storage') {
    return {
      isFetchingS3Endpoints,
      regions: null,
      s3Endpoints: [
        ...[{ label: GLOBAL_QUOTA_LABEL, value: GLOBAL_QUOTA_VALUE }],
        ...(s3Endpoints ?? [])
          .map((s3Endpoint) => {
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
  location: null | SelectOption<Quota['region_applied']>;
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

interface GetQuotaIncreaseFormDefaultValuesProps {
  profile: Profile | undefined;
  quantity: number;
  quota: Quota;
}

/**
 * Function to get the default values for the quota increase form
 */
export const getQuotaIncreaseMessage = ({
  profile,
  quantity,
  quota,
}: GetQuotaIncreaseFormDefaultValuesProps): QuotaIncreaseFormFields => {
  const regionAppliedLabel = quota.s3_endpoint ? 'Endpoint' : 'Region';
  const regionAppliedValue = quota.s3_endpoint ?? quota.region_applied;

  if (!profile) {
    return {
      description: '',
      notes: '',
      quantity: '0',
      summary: 'Increase Quota',
    };
  }

  return {
    description: `**User**: ${profile.username}<br>\n**Email**: ${
      profile.email
    }<br>\n**Quota Name**: ${
      quota.quota_name
    }<br>\n**New Quantity Requested**: ${quantity} ${quota.resource_metric}${
      quantity > 1 ? 's' : ''
    }<br>\n**${regionAppliedLabel}**: ${regionAppliedValue}`,
    notes: '',
    quantity: '0',
    summary: 'Increase Quota',
  };
};

export const getQuotaIncreaseFormSchema = object({
  description: string().required('Description is required.'),
  notes: string()
    .optional()
    .max(255, 'Notes must be less than 255 characters.'),
  quantity: string()
    .required('Quantity is required')
    .matches(/^[1-9]\d*$/, 'Quantity must be a number greater than 0.'),
  summary: string().required('Summary is required.'),
});
