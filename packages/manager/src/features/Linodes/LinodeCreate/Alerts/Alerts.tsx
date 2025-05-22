import { usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../LinodesDetail/AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from '../../LinodesDetail/LinodeSettings/LinodeSettingsAlertsPanel';

import type { LinodeCreateFormValues } from '../utilities';
import type { Alert } from '@linode/api-v4';

export const Alerts = () => {
  const flags = useFlags();
  const { data: isAclpAlertsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpAlertsBeta
  );

  const { control } = useFormContext<LinodeCreateFormValues>();
  const { field } = useController({
    control,
    name: 'alerts',
    defaultValue: { system: [], user: [] },
  });

  const handleToggleAlert = (alert: Alert) => {
    const alerts = field.value;
    const currentAlertIds = alerts?.[alert.type] || [];
    const updatedAlerts = { ...alerts };

    if (currentAlertIds.includes(alert.id)) {
      // Disable the alert (remove from the list)
      updatedAlerts[alert.type] = currentAlertIds.filter(
        (id) => id !== alert.id
      );
    } else {
      // Enable the alert (add to the list)
      updatedAlerts[alert.type] = [...currentAlertIds, alert.id];
    }

    field.onChange(updatedAlerts);
  };

  return (
    <Box>
      {flags.aclpIntegration && <AclpPreferenceToggle type="alerts" />}
      {flags.aclpIntegration && isAclpAlertsPreferenceBeta ? (
        <AlertReusableComponent
          enabledAlerts={field.value}
          onToggleAlert={handleToggleAlert}
          serviceType="linode"
        />
      ) : (
        <LinodeSettingsAlertsPanel isCreateFlow />
      )}
    </Box>
  );
};

export default Alerts;
