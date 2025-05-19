import { usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../LinodesDetail/AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from '../../LinodesDetail/LinodeSettings/LinodeSettingsAlertsPanel';

export const Alerts = () => {
  const flags = useFlags();
  const { data: isAclpAlertsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpAlertsBeta
  );

  return (
    <Box>
      {flags.aclpIntegration && <AclpPreferenceToggle type="alerts" />}
      {flags.aclpIntegration && isAclpAlertsPreferenceBeta ? (
        <AlertReusableComponent
          entityId={''}
          entityName={''}
          serviceType="linode"
        />
      ) : (
        <LinodeSettingsAlertsPanel isCreateFlow />
      )}
    </Box>
  );
};

export default Alerts;
