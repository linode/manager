import { Accordion, BetaChip } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { AclpPreferenceToggle } from 'src/features/Linodes/AclpPreferenceToggle';
import { AlertsPanel } from 'src/features/Linodes/LinodesDetail/LinodeAlerts/AlertsPanel';
import { useFlags } from 'src/hooks/useFlags';

import type { LinodeCreateFormValues } from '../../utilities';
import type { CloudPulseAlertsPayload } from '@linode/api-v4';

export const Alerts = ({
  isAclpAlertsBetaCreateFlow,
  setIsAclpAlertsBetaCreateFlow,
}: {
  isAclpAlertsBetaCreateFlow: boolean;
  setIsAclpAlertsBetaCreateFlow: (value: boolean) => void;
}) => {
  const { aclpBetaServices } = useFlags();

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
        aclpBetaServices?.linode?.alerts && isAclpAlertsBetaCreateFlow ? (
          <BetaChip />
        ) : undefined
      }
      subHeading="Receive notifications through system alerts when metric thresholds are exceeded."
      summaryProps={{ sx: { p: 0 } }}
    >
      {aclpBetaServices?.linode?.alerts && (
        <AclpPreferenceToggle
          isAclpBetaLocal={isAclpAlertsBetaCreateFlow}
          setIsAclpBetaLocal={setIsAclpAlertsBetaCreateFlow}
          type="alerts"
        />
      )}
      {aclpBetaServices?.linode?.alerts && isAclpAlertsBetaCreateFlow ? (
        // Beta ACLP Alerts View
        <AlertReusableComponent
          onToggleAlert={handleToggleAlert}
          serviceType="linode"
        />
      ) : (
        // Legacy Alerts View (read-only)
        <AlertsPanel />
      )}
    </Accordion>
  );
};
