import { useMutatePreferences, usePreferences } from '@linode/queries';
import {
  FormControlLabel,
  Notice,
  Paper,
  Toggle,
  Typography,
} from '@linode/ui';
import React from 'react';

export const AclpMetricsPreferenceToggle = () => {
  const { data: isAclpMetricsPreferenceBeta, isLoading } = usePreferences(
    (preferences) => preferences?.isAclpMetricsBeta
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const metricsLegacyNoticeText =
    'Try the new Metrics (Beta) with more options and greater flexibility for better data analysis. You can switch back to the current Metrics view anytime.';

  const metricsBetaNoticeText =
    'Welcome to Metrics (Beta) with more options and greater flexibility for better data analysis.';

  return (
    <Paper>
      <Typography marginBottom={1} variant="h2">
        {isAclpMetricsPreferenceBeta ? 'Metrics (Beta)' : 'Metrics'}
      </Typography>
      <FormControlLabel
        control={
          <Toggle
            checked={Boolean(isAclpMetricsPreferenceBeta)}
            onChange={(_, checked) =>
              updatePreferences({ isAclpMetricsBeta: checked })
            }
          />
        }
        disabled={isLoading}
        label={`${isAclpMetricsPreferenceBeta ? 'Metrics (Beta)' : 'Metrics'}`}
      />
      <Notice variant="info">
        {isAclpMetricsPreferenceBeta
          ? metricsBetaNoticeText
          : metricsLegacyNoticeText}
      </Notice>
    </Paper>
  );
};
