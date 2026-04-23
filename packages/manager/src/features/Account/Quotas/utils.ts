import { capitalize, readableBytes } from '@linode/utilities';
import { object, string } from 'yup';

import type { QuotaIncreaseFormFields } from './QuotasPanel/QuotasIncreaseForm';
import type { Profile, Quota } from '@linode/api-v4';
import type {
  QuotaScope,
  QuotaService,
  ScopeValueType,
} from 'src/features/Account/Quotas/quotaServices';

export interface QuotaWithUsage {
  fetchingUsageFailed: boolean;
  hasUsage: boolean;
  isFetchingUsage: boolean;
  quota: Quota;
  usage: null | number;
  usageFetchErrorMessage: null | string;
}

interface GetQuotaIncreaseFormDefaultValuesProps {
  convertedMetrics: {
    limit: number;
    metric: string;
  };
  neededIn: string;
  profile: Profile | undefined;
  quantity: number;
  quota: Quota;
  scope: QuotaScope;
  scopeValue: ScopeValueType;
  service: QuotaService;
}

/**
 * Function to get the default values for the quota increase form
 */
export const getQuotaIncreaseMessage = ({
  convertedMetrics,
  neededIn,
  profile,
  quantity,
  quota,
  service,
  scope,
  scopeValue,
}: GetQuotaIncreaseFormDefaultValuesProps): QuotaIncreaseFormFields => {
  if (!profile) {
    return {
      description: '',
      neededIn: 'Fewer than 7 days',
      notes: '',
      quantity: '0',
      summary: `Increase ${service.label} Quota`,
    };
  }

  let extraLine = '';
  if (scope === 'region') {
    extraLine = `<br>\n**Region**: ${scopeValue}`;
  } else if (scope === 'obj-endpoint') {
    extraLine = `<br>\n**Endpoint**: ${scopeValue}`;
  }

  return {
    description: `**User**: ${profile.username}<br>\n**Email**: ${
      profile.email
    }<br>\n**Quota Name**: ${
      quota.quota_name
    }<br>\n**Current Quota**: ${convertedMetrics.limit?.toLocaleString()} ${
      convertedMetrics.metric
    }<br>\n**New Quota Requested**: ${quantity?.toLocaleString()} ${
      convertedMetrics.metric
    }<br>\n**Needed in**: ${neededIn}${extraLine}`,
    neededIn: 'Fewer than 7 days',
    notes: '',
    quantity: String(quantity),
    summary: `Increase ${service.label} Quota`,
  };
};

interface ConvertResourceMetricProps {
  initialLimit: number;
  initialResourceMetric: Quota['resource_metric'];
  initialUsage: number;
}

/**
 * Function to convert the resource metric to a human-readable format
 */
export const convertResourceMetric = ({
  initialResourceMetric,
  initialUsage,
  initialLimit,
}: ConvertResourceMetricProps): {
  convertedLimit: number;
  convertedResourceMetric: string;
  convertedUsage: number;
} => {
  switch (initialResourceMetric) {
    case 'byte': {
      const limitReadable = readableBytes(initialLimit);

      return {
        convertedUsage: readableBytes(initialUsage, {
          unit: limitReadable.unit,
        }).value,
        convertedLimit: limitReadable.value,
        convertedResourceMetric: capitalize(limitReadable.unit),
      };
    }
    case 'byte_per_second': {
      return {
        convertedUsage: 0,
        convertedResourceMetric: 'Gbps',
        convertedLimit: readableBytes(initialLimit * 8, {
          unit: 'GB',
          base10: true,
        }).value,
      };
    }
    case 'gigabyte': {
      return {
        convertedUsage: initialUsage,
        convertedLimit: initialLimit,
        convertedResourceMetric: 'GB',
      };
    }
    default: {
      return {
        convertedUsage: initialUsage,
        convertedLimit: initialLimit,
        convertedResourceMetric: capitalize(
          pluralizeMetric(initialLimit, initialResourceMetric)
        ),
      };
    }
  }
};

/**
 * Function to pluralize the resource metric
 * If the unit is 'byte', we need to return the unit without an 's' (ex: 'GB', 'MB', 'TB')
 * Otherwise, we need to return the unit with an 's' (ex: 'Buckets', 'Objects')
 *
 * Note: the value should be the raw values in bytes, not an existing conversion
 */
export const pluralizeMetric = (
  value: number,
  unit: Quota['resource_metric']
): string => {
  return value > 1 ? `${unit}s` : unit;
};

export const getQuotaIncreaseFormSchema = (currentLimit: number) =>
  object({
    description: string().required('Description is required.'),
    neededIn: string().required('Needed in is required.'),
    notes: string()
      .required('Description is required.')
      .max(255, 'Description must be less than 255 characters.'),
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
