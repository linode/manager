import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Skeleton } from 'src/components/Skeleton';

export const AclpMetricsPreferenceToggle = () => {
  const { data: isAclpMetricsBeta, isLoading: isAclpMetricsBetaLoading } =
    usePreferences((preferences) => {
      return preferences?.isAclpMetricsBeta;
    });

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  if (isAclpMetricsBetaLoading) {
    return (
      <Skeleton
        data-testid="metrics-preference-skeleton"
        height="90px"
        sx={(theme) => ({
          marginTop: `-${theme.tokens.spacing.S20}`,
        })}
      />
    );
  }

  return (
    <DismissibleBanner
      actionButton={
        <Button
          buttonType="primary"
          onClick={() =>
            updatePreferences({ isAclpMetricsBeta: !isAclpMetricsBeta })
          }
          sx={{ textTransform: 'none' }}
        >
          {isAclpMetricsBeta
            ? 'Switch to legacy Metrics'
            : 'Try the Metrics (Beta)'}
        </Button>
      }
      dismissible={false}
      forceImportantIconVerticalCenter
      preferenceKey="metrics-preference"
      variant="info"
    >
      <Typography data-testid="metrics-preference-banner-text">
        {isAclpMetricsBeta ? (
          <span>
            Welcome to <strong>Metrics (Beta)</strong> with more options and
            greater flexibility for better data analysis.
          </span>
        ) : (
          <span>
            Try the new <strong>Metrics (Beta)</strong> with more options and
            greater flexibility for better data analysis. You can switch back to
            the current view at any time.
          </span>
        )}
      </Typography>
    </DismissibleBanner>
  );
};
