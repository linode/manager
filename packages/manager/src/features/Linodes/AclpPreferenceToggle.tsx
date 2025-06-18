import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Skeleton } from 'src/components/Skeleton';

import type { ManagerPreferences } from '@linode/utilities';

export interface AclpPreferenceToggleType {
  type: 'alerts' | 'metrics';
}

interface PreferenceConfigItem {
  getBannerText: (isBeta: boolean | undefined) => JSX.Element;
  getButtonText: (isBeta: boolean | undefined) => string;
  preferenceKey: string;
  updateKey: keyof ManagerPreferences;
  usePreferenceSelector: (
    preferences: ManagerPreferences | undefined
  ) => boolean | undefined;
}

const preferenceConfig: Record<
  AclpPreferenceToggleType['type'],
  PreferenceConfigItem
> = {
  metrics: {
    usePreferenceSelector: (preferences) => preferences?.isAclpMetricsBeta,
    updateKey: 'isAclpMetricsBeta',
    preferenceKey: 'metrics-preference',
    getButtonText: (isBeta) =>
      isBeta ? 'Switch to legacy Metrics' : 'Try the Metrics (Beta)',
    getBannerText: (isBeta) =>
      isBeta ? (
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
      ),
  },
  alerts: {
    usePreferenceSelector: (preferences) => preferences?.isAclpAlertsBeta,
    updateKey: 'isAclpAlertsBeta',
    preferenceKey: 'alerts-preference',
    getButtonText: (isBeta) =>
      isBeta ? 'Switch to legacy Alerts' : 'Try Alerts (Beta)',
    getBannerText: (isBeta) =>
      isBeta ? (
        <span>
          Welcome to <strong>Alerts (Beta)</strong> with more options and
          greater flexibility.
        </span>
      ) : (
        <span>
          Try the new <strong>Alerts (Beta)</strong> for more options, including
          customizable alerts. You can switch back to the current view at any
          time.
        </span>
      ),
  },
};

export const AclpPreferenceToggle = ({ type }: AclpPreferenceToggleType) => {
  const config = preferenceConfig[type];

  const { data: isBeta, isLoading } = usePreferences(
    config.usePreferenceSelector
  );

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  if (isLoading) {
    return (
      <Skeleton
        data-testid={`${type}-preference-skeleton`}
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
            updatePreferences({
              [config.updateKey]: !isBeta,
            })
          }
          sx={{ textTransform: 'none' }}
        >
          {config.getButtonText(isBeta)}
        </Button>
      }
      dismissible={false}
      forceImportantIconVerticalCenter
      preferenceKey={config.preferenceKey}
      variant="info"
    >
      <Typography data-testid={`${type}-preference-banner-text`}>
        {config.getBannerText(isBeta)}
      </Typography>
    </DismissibleBanner>
  );
};
