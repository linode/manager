import { usePreferences } from '@linode/queries';
import { Accordion, BetaChip } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { AclpPreferenceToggle } from 'src/features/Linodes/LinodesDetail/AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from 'src/features/Linodes/LinodesDetail/LinodeSettings/LinodeSettingsAlertsPanel';
import { useFlags } from 'src/hooks/useFlags';

import type { LinodeCreateFormValues } from '../../utilities';
import type { CloudPulseAlertsPayload } from '@linode/api-v4';

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

  const handleToggleAlert = (updatedAlerts: CloudPulseAlertsPayload) => {
    field.onChange(updatedAlerts);
  };

  return (
    <Accordion
      detailProps={{ sx: { p: 0 } }}
      heading="Alerts"
      headingChip={
        flags.aclpIntegration && isAclpAlertsPreferenceBeta ? (
          <BetaChip />
        ) : undefined
      }
      subHeading="Receive notifications through system alerts when metric thresholds are exceeded."
      summaryProps={{ sx: { p: 0 } }}
    >
      {flags.aclpIntegration && <AclpPreferenceToggle type="alerts" />}
      {flags.aclpIntegration && isAclpAlertsPreferenceBeta ? (
        <AlertReusableComponent
          onToggleAlert={handleToggleAlert}
          serviceType="linode"
        />
      ) : (
        <LinodeSettingsAlertsPanel isCreateFlow />
      )}
    </Accordion>
  );
};

export default Alerts;
