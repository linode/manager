import React from 'react';

import { AclpAlertsPreferenceToggle } from './AclpAlertsPreferenceToggle';
import { AclpMetricsPreferenceToggle } from './AclpMetricsPreferenceToggle';

interface AclpPreferenceToggleType {
  /**
   * Handler for alerts toggle. Use only when type is `alerts`
   */
  handleIsAclpAlertsBetaLocal?: (isBeta: boolean) => void;
  /**
   * Alerts toggle state. Use only when type is `alerts`
   */
  isAclpAlertsBetaLocal?: boolean;
  /**
   * Toggle type: `alerts` or `metrics`
   */
  type: 'alerts' | 'metrics';
}

export const AclpPreferenceToggle = (props: AclpPreferenceToggleType) => {
  const { handleIsAclpAlertsBetaLocal, isAclpAlertsBetaLocal, type } = props;

  if (type === 'alerts' && handleIsAclpAlertsBetaLocal) {
    return (
      <AclpAlertsPreferenceToggle
        handleIsAclpAlertsBetaLocal={handleIsAclpAlertsBetaLocal}
        isAclpAlertsBetaLocal={isAclpAlertsBetaLocal ?? false}
      />
    );
  }

  if (type === 'metrics') {
    return <AclpMetricsPreferenceToggle />;
  }

  return null;
};
