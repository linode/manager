import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Button, Typography, useTheme } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Skeleton } from 'src/components/Skeleton';

export const AclpMetricsPreferenceToggle = () => {
  const theme = useTheme();

  const { data: isAclpMetricsPreferenceBeta, isLoading } = usePreferences(
    (preferences) => preferences?.isAclpMetricsBeta
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const metricsLegacyNoticeText =
    'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current Metrics view anytime.';

  const metricsBetaNoticeText =
    'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.';

  if (isLoading) {
    return (
      <Skeleton
        height="92px"
        sx={{ marginTop: `-${theme.spacingFunction(20)}` }}
      />
    );
  }

  return (
    <DismissibleBanner
      actionButton={
        <Button
          buttonType="primary"
          onClick={() =>
            updatePreferences({
              isAclpMetricsBeta: !isAclpMetricsPreferenceBeta,
            })
          }
          sx={{ textTransform: 'none' }}
        >
          {isAclpMetricsPreferenceBeta
            ? 'Switch to legacy Metrics'
            : 'Try the Metrics (Beta)'}
        </Button>
      }
      forceImportantIconVerticalCenter
      isNotDismissible
      preferenceKey="metrics-preference"
      variant="info"
    >
      <Typography>
        {isAclpMetricsPreferenceBeta
          ? metricsBetaNoticeText
          : metricsLegacyNoticeText}
      </Typography>
    </DismissibleBanner>
  );
};
