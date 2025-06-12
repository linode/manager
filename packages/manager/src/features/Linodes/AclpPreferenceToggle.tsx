import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Skeleton } from 'src/components/Skeleton';

type AlertsToggleType = {
  isAclpBetaLocal: boolean;
  setIsAclpBetaLocal: (value: boolean) => void;
  type: 'alerts';
};

type MetricsToggleType = {
  /**
   * `isAclpBetaLocal` prop is not allowed for metrics type.
   */
  isAclpBetaLocal?: never;
  /**
   * `setIsAclpBetaLocal` is not allowed for metrics type.
   */
  setIsAclpBetaLocal?: never;
  type: 'metrics';
};

/**
 * ACLP preference toggle type configuration.
 *
 * For `alerts`, the `isAclpBetaLocal` and `setIsAclpBetaLocal` props are required.
 * For `metrics`, ACLP beta-related props are not allowed.
 */
export type AclpPreferenceToggleType = AlertsToggleType | MetricsToggleType;

interface PreferenceConfigItem {
  getBannerText: (isBeta: boolean | undefined) => JSX.Element;
  getButtonText: (isBeta: boolean | undefined) => string;
  preferenceKey: string;
}

const preferenceConfig: Record<
  AclpPreferenceToggleType['type'],
  PreferenceConfigItem
> = {
  metrics: {
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

export const AclpPreferenceToggle = (props: AclpPreferenceToggleType) => {
  const { type, isAclpBetaLocal, setIsAclpBetaLocal } = props;

  const config = preferenceConfig[type];

  const { data: isAclpMetricsBeta, isLoading: isAclpMetricsBetaLoading } =
    usePreferences((preferences) => {
      return preferences?.isAclpMetricsBeta;
    }, type === 'metrics');

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const isBeta = type === 'alerts' ? isAclpBetaLocal : isAclpMetricsBeta;

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
            type === 'alerts'
              ? setIsAclpBetaLocal(!isBeta)
              : updatePreferences({ isAclpMetricsBeta: !isBeta })
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
