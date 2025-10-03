import {
  Box,
  CircleProgress,
  ErrorState,
  Typography,
  useTheme,
} from '@linode/ui';
import * as React from 'react';

import { QuotaUsageBar } from 'src/components/QuotaUsageBar/QuotaUsageBar';

import { useGetObjUsagePerEndpoint } from '../hooks/useGetObjUsagePerEndpoint';

interface Props {
  endpoint: string;
}

export const EndpointSummaryRow = ({ endpoint }: Props) => {
  const theme = useTheme();

  const {
    data: quotaWithUsage,
    isFetching,
    isError,
  } = useGetObjUsagePerEndpoint(endpoint);

  if (isError) {
    return (
      <>
        <hr />
        <ErrorState
          compact={true}
          errorText={`There was an error retrieving ${endpoint} endpoint data.`}
        />
      </>
    );
  }

  return (
    <>
      <hr />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(16),
          padding: theme.spacingFunction(8),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3>{endpoint}</h3>
        </Box>

        <Box sx={{ display: 'flex', gap: '3rem', justifyContent: 'center' }}>
          {isFetching && <CircleProgress size="md" />}

          {!isFetching &&
            quotaWithUsage.map((quota, index) => {
              return (
                <Box key={index} sx={{ flex: 1 }}>
                  <Typography>{quota.quota_name}</Typography>
                  <QuotaUsageBar
                    limit={quota.quota_limit}
                    resourceMetric={quota.resource_metric}
                    usage={quota?.usage?.usage ?? 0}
                  />
                </Box>
              );
            })}
        </Box>
      </Box>
    </>
  );
};
