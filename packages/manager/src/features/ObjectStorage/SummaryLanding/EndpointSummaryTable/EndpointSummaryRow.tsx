import { Box, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';
import { useQuotasWithUsageQuery } from 'src/features/Account/Quotas/hooks/useQuotasWithUsageQuery';
import { objectStorageQuotaService } from 'src/features/Account/Quotas/quotaServices';
import { useFlags } from 'src/hooks/useFlags';

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

  if (
    isFetchingQuotas ||
    quotasWithUsage?.some((quotaWithUsage) => quotaWithUsage.isFetchingUsage)
  ) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <CircleProgress size="md" />
      </Box>
    );
  }

  if (isError) {
    return (
      <ErrorState
        compact={true}
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

  return (
    <Box>
      <Box
        sx={(theme) => ({
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: theme.spacingFunction(8),
        })}
      >
        <Typography
          sx={(theme) => ({
            font: theme.tokens.alias.Typography.Heading.Xs,
          })}
        >
          {endpoint.s3_endpoint}
        </Typography>

        {objectStorageSummaryPageLinks && (
          <Link
            to={`/object-storage/buckets?endpoints=${endpoint.s3_endpoint}&regions=${endpoint.region}`}
          >
            Show buckets
          </Link>
        )}
      </Box>

      <Grid container spacing={8}>
        {displayedQuotaTypes.map(({ label, type }) => {
          const quotaWithUsage = quotasByType[type];

          return (
            <Grid key={type} size={{ sm: 4 }}>
              <Typography
                sx={(theme) => ({
                  font: theme.tokens.alias.Typography.Label.Regular.S,
                  color: theme.tokens.color.Neutrals[70],
                  paddingY: theme.spacingFunction(2),
                })}
              >
                {label}
              </Typography>

              {quotaWithUsage && !quotaWithUsage.fetchingUsageFailed ? (
                <QuotaUsageBar
                  limit={quotaWithUsage.quota.quota_limit}
                  resourceMetric={quotaWithUsage.quota.resource_metric}
                  usage={quotaWithUsage.usage ?? 0}
                  variant="obj-summary"
                />
              ) : (
                <Typography>Data not available</Typography>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
