import { Accordion, BetaChip } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
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
  const { aclpServices } = useFlags();

  const { control } = useFormContext<LinodeCreateFormValues>();
  const { field } = useController({
    control,
    name: 'alerts',
    defaultValue: { system: [], user: [] },
  });

  const handleToggleAlert = (updatedAlerts: CloudPulseAlertsPayload) => {
    field.onChange(updatedAlerts);
  };

  const subHeading = isAlertsBetaMode ? (
    <>
      Receive notifications through System Alerts when metric thresholds are
      exceeded. After you&apos;ve created your Linode, you can create and manage
      associated alerts on the <strong>centralized Alerts</strong> page.{' '}
      <Link to="https://techdocs.akamai.com/cloud-computing/docs/configure-email-alerts-for-resource-usage-on-compute-instances">
        Learn more
      </Link>
      .
    </>
  ) : (
    'Configure the alert notifications to be sent when metric thresholds are exceeded.'
  );

  return (
    <Accordion
      detailProps={{ sx: { p: 0 } }}
      heading="Alerts"
      headingChip={
        aclpServices?.linode?.alerts?.beta && isAlertsBetaMode ? (
          <BetaChip />
        ) : null
      }
      subHeading={subHeading}
      summaryProps={{ sx: { p: 0 } }}
    >
      {aclpServices?.linode?.alerts?.enabled && (
        <AclpPreferenceToggle
          isAlertsBetaMode={isAlertsBetaMode}
          onAlertsModeChange={onAlertsModeChange}
          type="alerts"
        />
      )}
      {aclpServices?.linode?.alerts?.enabled && isAlertsBetaMode ? (
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
