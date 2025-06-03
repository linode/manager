import { usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../LinodesDetail/AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from '../../LinodesDetail/LinodeSettings/LinodeSettingsAlertsPanel';

import type { LinodeCreateFormValues } from '../utilities';
import type { LinodeAclpAlertsPayload } from '@linode/api-v4';

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

  const handleToggleAlert = (updatedAlerts: LinodeAclpAlertsPayload) => {
    field.onChange(updatedAlerts);
  };

  return (
    <Box>
      {flags.aclpIntegration && <AclpPreferenceToggle type="alerts" />}
      {flags.aclpIntegration && isAclpAlertsPreferenceBeta ? (
        <AlertReusableComponent
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
