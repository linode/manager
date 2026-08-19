import * as React from 'react';

import { LinearProgress } from 'src/components/LinearProgress';
import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { useQuotasWithUsageQuery } from 'src/features/Account/Quotas/hooks/useQuotasWithUsageQuery';
import { objectStorageQuotaService } from 'src/features/Account/Quotas/quotaServices';
import { useFlags } from 'src/hooks/useFlags';

import { ErrorState } from '../shared/components/ErrorState/ErrorState';
import { Link } from '../shared/components/Link/Link';

import type {
  ObjectStorageEndpoint,
  ObjectStorageEndpointQuota,
} from '@linode/api-v4';
import type { QuotaWithUsage } from 'src/features/Account/Quotas/utils';

interface Props {
  endpoint: ObjectStorageEndpoint;
}

export const EndpointSummaryRow = ({ endpoint }: Props) => {
  const service = objectStorageQuotaService();
  const { objectStorageSummaryPageLinks } = useFlags();

  const {
    data: quotasWithUsage,
    isFetching: isFetchingQuotas,
    isError,
  } = useQuotasWithUsageQuery({
    service,
    scope: 'obj-endpoint',
    scopeValue: endpoint.s3_endpoint,
    enabled: Boolean(endpoint),
  });

  const isLoading =
    isFetchingQuotas ||
    quotasWithUsage?.some((quotaWithUsage) => quotaWithUsage.isFetchingUsage);

  if (isError) {
    return (
      <ErrorState
        errorText={`There was an error retrieving ${endpoint.s3_endpoint} endpoint data.`}
      />
    );
  }

  const quotasByType = quotasWithUsage.reduce(
    (acc, quotaWithUsage) => {
      acc[(quotaWithUsage.quota as ObjectStorageEndpointQuota).quota_type] =
        quotaWithUsage;
      return acc;
    },
    {} as Record<ObjectStorageEndpointQuota['quota_type'], QuotaWithUsage>
  );

  const displayedQuotaTypes: {
    label: string;
    type: ObjectStorageEndpointQuota['quota_type'];
  }[] = [
    { label: 'Content stored', type: 'obj-bytes' },
    { label: 'Objects', type: 'obj-objects' },
    { label: 'Buckets', type: 'obj-buckets' },
  ];

  function getUsageBar(quotaWithUsage: QuotaWithUsage) {
    if (isLoading) {
      return (
        <LinearProgress
          sx={{
            padding: 'var(--token-global-spacing-s4)',
            marginBottom: 'var(--token-global-spacing-s24)',
          }}
        />
      );
    }

    if (quotaWithUsage && !quotaWithUsage.fetchingUsageFailed) {
      return (
        <QuotaUsageBar
          layout="wide"
          limit={quotaWithUsage.quota.quota_limit}
          resourceMetric={quotaWithUsage.quota.resource_metric}
          usage={quotaWithUsage.usage ?? 0}
        />
      );
    }

    return <p>Data not available</p>;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 'var(--token-global-spacing-s8)',
        }}
      >
        <h6>{endpoint.s3_endpoint}</h6>

        {objectStorageSummaryPageLinks && (
          <Link
            to={`/object-storage/buckets?regions=${endpoint.region}&endpoints=${endpoint.s3_endpoint}`}
          >
            Show buckets
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--token-global-spacing-s64)' }}>
        {displayedQuotaTypes.map(({ label, type }) => {
          const quotaWithUsage = quotasByType[type];

          return (
            <div key={type} style={{ flex: '1' }}>
              <label
                style={{
                  color: 'var(--token-alias-content-text-secondary-default)',
                }}
              >
                {label}
              </label>

              {getUsageBar(quotaWithUsage)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
