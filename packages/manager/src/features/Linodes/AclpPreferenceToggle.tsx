import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import React, { type JSX } from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Skeleton } from 'src/components/Skeleton';

export interface AclpPreferenceToggleType {
  /**
   * Alerts toggle state. Use only when type is `alerts`
   */
  isAlertsBetaMode?: boolean;
  /**
   * Handler for alerts toggle. Use only when type is `alerts`
   */
  onAlertsModeChange?: (isBeta: boolean) => void;
  /**
   * Toggle type: `alerts` or `metrics`
   */
  type: 'alerts' | 'metrics';
}

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
          Welcome to <strong>Alerts (Beta)</strong>, designed for flexibility
          with features like customizable alerts.
        </span>
      ) : (
        <span>
          Try the <strong>Alerts (Beta)</strong>, featuring new options like
          customizable alerts. You can switch back to legacy Alerts at any time.
        </span>
      ),
  },
};

/**
 * - For Alerts, the toggle uses local state, not preferences. We do this because each Linode should manage its own alert mode individually.
 *   - Create Linode: Toggle defaults to false (legacy mode). It's a simple UI toggle with no persistence.
 *   - Edit Linode: Toggle defaults based on useIsLinodeAclpSubscribed (true if the Linode is already subscribed to ACLP). Still local state - not saved to preferences.
 *
 * - For Metrics, we use account-level preferences, since it's a global setting shared across all Linodes.
 */
export const AclpPreferenceToggle = (props: AclpPreferenceToggleType) => {
  const { isAlertsBetaMode, onAlertsModeChange, type } = props;

  const config = preferenceConfig[type];

  // -------------------- Metrics related logic ------------------------
  const { data: isAclpMetricsBeta, isLoading: isAclpMetricsBetaLoading } =
    usePreferences((preferences) => {
      return preferences?.isAclpMetricsBeta;
    }, type === 'metrics');

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
  // -------------------------------------------------------------------

  const isBeta = type === 'alerts' ? isAlertsBetaMode : isAclpMetricsBeta;
  const handleBetaToggle = () => {
    if (type === 'alerts' && onAlertsModeChange) {
      onAlertsModeChange(!isBeta);
    } else {
      updatePreferences({ isAclpMetricsBeta: !isBeta });
    }
  };

  return (
    <DismissibleBanner
      actionButton={
        <Button
          buttonType="primary"
          onClick={handleBetaToggle}
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
