import { Button, Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';

import type { ManagerPreferences } from '@linode/utilities';

export interface AclpPreferenceToggleType {
  isAclpBetaLocal: boolean;
  setIsAclpBetaLocal: React.Dispatch<React.SetStateAction<boolean>>;
  type: 'alerts' | 'metrics';
}

interface PreferenceConfigItem {
  getBannerText: (isBeta: boolean | undefined) => JSX.Element;
  getButtonText: (isBeta: boolean | undefined) => string;
  preferenceKey: string;
  updateKey: keyof ManagerPreferences;
}

const preferenceConfig: Record<
  AclpPreferenceToggleType['type'],
  PreferenceConfigItem
> = {
  metrics: {
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

export const AclpPreferenceToggle = ({
  type,
  setIsAclpBetaLocal,
  isAclpBetaLocal,
}: AclpPreferenceToggleType) => {
  const config = preferenceConfig[type];

  return (
    <DismissibleBanner
      actionButton={
        <Button
          buttonType="primary"
          onClick={() => setIsAclpBetaLocal(!isAclpBetaLocal)}
          sx={{ textTransform: 'none' }}
        >
          {config.getButtonText(isAclpBetaLocal)}
        </Button>
      }
      dismissible={false}
      forceImportantIconVerticalCenter
      preferenceKey={config.preferenceKey}
      variant="info"
    >
      <Typography data-testid={`${type}-preference-banner-text`}>
        {config.getBannerText(isAclpBetaLocal)}
      </Typography>
    </DismissibleBanner>
  );
};
