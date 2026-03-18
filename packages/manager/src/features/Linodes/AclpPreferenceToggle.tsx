import { useMutatePreferences, usePreferences } from '@linode/queries';
import { Button, Typography } from '@linode/ui';
import type { JSX } from 'react';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { Skeleton } from 'src/components/Skeleton';
import { useFlags } from 'src/hooks/useFlags';

export interface AclpPreferenceToggleType {
  /**
   * Alerts toggle state. Use only when type is `alerts`
   */
  isAclpAlertsMode?: boolean;
  /**
   * Handler for alerts toggle. Use only when type is `alerts`
   */
  onAlertsModeChange?: (isAclpMode: boolean) => void;
  /**
   * Toggle type: `alerts` or `metrics`
   */
  type: 'alerts' | 'metrics';
}

interface PreferenceConfigItem {
  getBannerText: (
    isAclpMode: boolean | undefined,
    isAclpBeta: boolean | undefined
  ) => JSX.Element;
  getButtonText: (
    isAclpMode: boolean | undefined,
    isAclpBeta: boolean | undefined
  ) => string;
  preferenceKey: string;
}

const preferenceConfig: Record<
  AclpPreferenceToggleType['type'],
  PreferenceConfigItem
> = {
  metrics: {
    preferenceKey: 'metrics-preference',
    getButtonText: (isAclpMode, isAclpBeta) => {
      const aclpText = isAclpBeta ? 'Try Metrics (Beta)' : 'Try Metrics (New)';
      return isAclpMode ? 'Switch to legacy Metrics' : aclpText;
    },
    getBannerText: (isAclpMode, isAclpBeta) => {
      const aclpText = isAclpBeta ? 'Metrics (Beta)' : 'Metrics (New)';

      return isAclpMode ? (
        <span>
          Welcome to <strong>{aclpText}</strong> with more options and greater
          flexibility for better data analysis.
        </span>
      ) : (
        <span>
          Try the new <strong>{aclpText}</strong> with more options and greater
          flexibility for better data analysis. You can switch back to the
          current view at any time.
        </span>
      );
    },
  },
  alerts: {
    preferenceKey: 'alerts-preference',
    getButtonText: (isAclpMode, isAclpBeta) => {
      const aclpText = isAclpBeta ? 'Try Alerts (Beta)' : 'Try Alerts (New)';
      return isAclpMode ? 'Switch to legacy Alerts' : aclpText;
    },
    getBannerText: (isAclpMode, isAclpBeta) => {
      const aclpText = isAclpBeta ? 'Alerts (Beta)' : 'Alerts (New)';

      return isAclpMode ? (
        <span>
          Welcome to <strong>{aclpText}</strong>, designed for flexibility with
          features like customizable alerts.
        </span>
      ) : (
        <span>
          Try the <strong>{aclpText}</strong>, featuring new options like
          customizable alerts. You can switch back to legacy Alerts at any time.
        </span>
      );
    },
  },
};

/**
 * - For Alerts, the toggle uses local state, not preferences. We do this because each Linode should manage its own alert mode individually.
 *   - Create Linode: Toggle defaults to false (legacy mode). It's a simple UI toggle with no persistence.
 *
 * - For Metrics, we use account-level preferences, since it's a global setting shared across all Linodes.
 */
export const AclpPreferenceToggle = (props: AclpPreferenceToggleType) => {
  const { isAclpAlertsMode, onAlertsModeChange, type } = props;

  const { aclpAlerting, aclp } = useFlags();

  const config = preferenceConfig[type];

  // -------------------- Metrics related logic ------------------------
  const { data: isAclpMetricsMode, isLoading: isAclpMetricsModeLoading } =
    usePreferences((preferences) => {
      return preferences?.isAclpMetricsMode;
    }, type === 'metrics');

  const { mutateAsync: updatePreferences } = useMutatePreferences();

  if (isAclpMetricsModeLoading) {
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

  const isAclpMode = type === 'alerts' ? isAclpAlertsMode : isAclpMetricsMode;

  const isAclpModeBeta = type === 'alerts' ? aclpAlerting?.beta : aclp?.beta;

  const handleBetaToggle = () => {
    if (type === 'alerts' && onAlertsModeChange) {
      onAlertsModeChange(!isAclpMode);
    } else {
      updatePreferences({ isAclpMetricsMode: !isAclpMode });
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
          {config.getButtonText(isAclpMode, isAclpModeBeta)}
        </Button>
      }
      dismissible={false}
      forceImportantIconVerticalCenter
      preferenceKey={config.preferenceKey}
      variant="info"
    >
      <Typography data-testid={`${type}-preference-banner-text`}>
        {config.getBannerText(isAclpMode, isAclpModeBeta)}
      </Typography>
    </DismissibleBanner>
  );
};
