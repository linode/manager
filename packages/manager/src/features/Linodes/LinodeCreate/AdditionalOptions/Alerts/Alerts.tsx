import { usePreferences } from '@linode/queries';
import { Accordion, BetaChip, Notice } from '@linode/ui';
import * as React from 'react';

import { AclpPreferenceToggle } from 'src/features/Linodes/AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from 'src/features/Linodes/LinodesDetail/LinodeSettings/LinodeSettingsAlertsPanel';
import { useFlags } from 'src/hooks/useFlags';

export const Alerts = () => {
  const flags = useFlags();
  const { data: isAclpAlertsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpAlertsBeta
  );

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
        <Notice variant="info">ACLP Alerts comming soon...</Notice>
      ) : (
        <LinodeSettingsAlertsPanel />
      )}
    </Accordion>
  );
};

export default Alerts;
