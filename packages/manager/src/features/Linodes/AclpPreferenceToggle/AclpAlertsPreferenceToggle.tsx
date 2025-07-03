import { Button, Typography } from '@linode/ui';
import React from 'react';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';

interface AclpAlertsPreferencToggleProps {
  handleIsAclpAlertsBetaLocal: (isBeta: boolean) => void;
  isAclpAlertsBetaLocal: boolean;
}

export const AclpAlertsPreferenceToggle = (
  props: AclpAlertsPreferencToggleProps
) => {
  const { handleIsAclpAlertsBetaLocal, isAclpAlertsBetaLocal } = props;
  return (
    <DismissibleBanner
      actionButton={
        <Button
          buttonType="primary"
          onClick={() => handleIsAclpAlertsBetaLocal(!isAclpAlertsBetaLocal)}
          sx={{ textTransform: 'none' }}
        >
          {isAclpAlertsBetaLocal
            ? 'Switch to legacy Alerts'
            : 'Try Alerts (Beta)'}
        </Button>
      }
      dismissible={false}
      forceImportantIconVerticalCenter
      preferenceKey="alerts-preference"
      variant="info"
    >
      <Typography data-testid="alerts-preference-banner-text">
        {isAclpAlertsBetaLocal ? (
          <span>
            Welcome to <strong>Alerts (Beta)</strong>, designed for flexibility
            with features like customizable alerts.
          </span>
        ) : (
          <span>
            Try the <strong>Alerts (Beta)</strong>, featuring new options like
            customizable alerts. You can switch back to legacy Alerts at any
            time.
          </span>
        )}
      </Typography>
    </DismissibleBanner>
  );
};
