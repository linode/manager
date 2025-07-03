import { usePreferences } from '@linode/queries';
import { Accordion, BetaChip } from '@linode/ui';
import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { AclpPreferenceToggle } from 'src/features/Linodes/AclpPreferenceToggle';
import { AlertsPanel } from 'src/features/Linodes/LinodesDetail/LinodeAlerts/AlertsPanel';
import { useFlags } from 'src/hooks/useFlags';

import type { LinodeCreateFormValues } from '../../utilities';
import type { CloudPulseAlertsPayload } from '@linode/api-v4';

export const Alerts = () => {
  const { aclpBetaServices } = useFlags();
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

  const subHeading = isAclpAlertsPreferenceBeta ? (
    <>
      Receive notifications through System Alerts when metric thresholds are
      exceeded. After you've created your Linode, you can create and manage
      associated alerts on the <strong>centralized Alerts</strong> page.{' '}
      <Link to="https://techdocs.akamai.com/cloud-computing/docs/configure-email-alerts-for-resource-usage-on-compute-instances">
        Learn more.
      </Link>
    </>
  ) : (
    'Configure the alert notifications to be sent when metric thresholds are exceeded.'
  );

  return (
    <Accordion
      detailProps={{ sx: { p: 0 } }}
      heading="Alerts"
      headingChip={
        aclpBetaServices?.linode?.alerts && isAclpAlertsPreferenceBeta ? (
          <BetaChip />
        ) : null
      }
      subHeading={subHeading}
      summaryProps={{ sx: { p: 0 } }}
    >
      {aclpBetaServices?.linode?.alerts && (
        <AclpPreferenceToggle type="alerts" />
      )}
      {aclpBetaServices?.linode?.alerts && isAclpAlertsPreferenceBeta ? (
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
