import { Accordion, BetaChip } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { AlertsPanel } from 'src/features/Linodes/LinodesDetail/LinodeAlerts/AlertsPanel';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';

import type { LinodeCreateFormValues } from '../utilities';
import type { CloudPulseAlertsPayload } from '@linode/api-v4';

interface AlertsProps {
  isAlertsBetaMode: boolean;
  onAlertsModeChange: (isBeta: boolean) => void;
}

export const Alerts = ({
  onAlertsModeChange,
  isAlertsBetaMode,
}: AlertsProps) => {
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
        aclpBetaServices?.linode?.alerts && isAlertsBetaMode ? (
          <BetaChip />
        ) : null
      }
      subHeading="Receive notifications through system alerts when metric thresholds are exceeded."
      summaryProps={{ sx: { p: 0 } }}
    >
      {aclpBetaServices?.linode?.alerts && (
        <AclpPreferenceToggle
          isAlertsBetaMode={isAlertsBetaMode}
          onAlertsModeChange={onAlertsModeChange}
          type="alerts"
        />
      )}
      {aclpBetaServices?.linode?.alerts && isAlertsBetaMode ? (
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
