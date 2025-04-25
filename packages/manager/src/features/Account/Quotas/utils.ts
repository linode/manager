import { useRegionsQuery } from '@linode/queries';
import { capitalize, readableBytes } from '@linode/utilities';
import { object, string } from 'yup';

import { regionSelectGlobalOption } from 'src/components/RegionSelect/constants';
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
  convertedMetrics: {
    limit: number;
    metric: string;
  };
  profile: Profile | undefined;
  quantity: number;
  quota: Quota;
  selectedService: SelectOption<QuotaType>;
}

/**
 * Function to get the default values for the quota increase form
 */
export const getQuotaIncreaseMessage = ({
  convertedMetrics,
  profile,
  quantity,
  quota,
  selectedService,
}: GetQuotaIncreaseFormDefaultValuesProps): QuotaIncreaseFormFields => {
  const regionAppliedLabel = quota.s3_endpoint ? 'Endpoint' : 'Region';
  const regionAppliedValue = quota.s3_endpoint ?? quota.region_applied;

  if (!profile) {
    return {
      description: '',
      notes: '',
      quantity: '0',
      summary: `Increase ${selectedService.label} Quota`,
    };
  }

  return {
    description: `**User**: ${profile.username}<br>\n**Email**: ${
      profile.email
    }<br>\n**Quota Name**: ${
      quota.quota_name
    }<br>\n**Current Quota**: ${convertedMetrics.limit} ${
      convertedMetrics.metric
    }<br>\n**New Quota Requested**: ${quantity} ${convertedMetrics.metric}${
      quantity > 1 ? 's' : ''
    }<br>\n**${regionAppliedLabel}**: ${regionAppliedValue}`,
    notes: '',
    quantity: String(quantity),
    summary: `Increase ${selectedService.label} Quota`,
  };
};

interface ConvertResourceMetricProps {
  initialLimit: number;
  initialResourceMetric: string;
  initialUsage: number;
}

/**
 * Function to convert the resource metric to a human readable format
 */
export const convertResourceMetric = ({
  initialResourceMetric,
  initialUsage,
  initialLimit,
}: ConvertResourceMetricProps): {
  convertedLimit: string;
  convertedResourceMetric: string;
  convertedUsage: number;
} => {
  if (initialResourceMetric === 'byte') {
    const limitReadable = readableBytes(initialLimit);

    return {
      convertedUsage: readableBytes(initialUsage, {
        unit: limitReadable.unit,
      }).value,
      convertedResourceMetric: capitalize(limitReadable.unit),
      convertedLimit: String(limitReadable.value),
    };
  }

  return {
    convertedUsage: initialUsage,
    convertedLimit: initialLimit.toLocaleString(),
    convertedResourceMetric: capitalize(initialResourceMetric),
  };
};

/**
 * Function to pluralize the resource metric
 * If the unit is 'byte', we need to return the unit without an 's' (ex: 'GB', 'MB', 'TB')
 * Otherwise, we need to return the unit with an 's' (ex: 'Buckets', 'Objects')
 *
 * Note: the value should be the raw values in bytes, not an existing conversion
 */
export const pluralizeMetric = (value: number, unit: string) => {
  if (unit !== 'byte') {
    return value > 1 ? `${unit}s` : unit;
  }

  return unit;
};

export const getQuotaIncreaseFormSchema = (currentLimit: number) =>
  object({
    description: string().required('Description is required.'),
    notes: string()
      .optional()
      .max(255, 'Notes must be less than 255 characters.'),
    quantity: string()
      .required('Quantity is required')
      .test(
        'is-greater-than-limit',
        `Quantity must be greater than the current quota of ${currentLimit.toLocaleString()}.`,
        (value) => {
          const num = parseFloat(value);
          return !isNaN(num) && num > currentLimit;
        }
      ),
    // .matches(/^\d*\.?\d*$/, 'Must be a valid number'), // allows decimals
    summary: string().required('Summary is required.'),
  });
