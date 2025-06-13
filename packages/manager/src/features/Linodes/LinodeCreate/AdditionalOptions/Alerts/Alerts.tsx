import { Accordion, BetaChip, Notice } from '@linode/ui';
import * as React from 'react';

import { AclpPreferenceToggle } from 'src/features/Linodes/AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from 'src/features/Linodes/LinodesDetail/LinodeSettings/LinodeSettingsAlertsPanel';
import { useFlags } from 'src/hooks/useFlags';

export const Alerts = () => {
  const flags = useFlags();

  const [isAclpAlertsBetaLocalCreateFlow, setIsAclpBetaLocalCreateFlow] =
    React.useState<boolean>(false);

  return (
    <Accordion
      detailProps={{ sx: { p: 0 } }}
      heading="Alerts"
      headingChip={
        flags.aclpBetaServices?.alerts && isAclpAlertsBetaLocalCreateFlow ? (
          <BetaChip />
        ) : undefined
      }
      subHeading="Receive notifications through system alerts when metric thresholds are exceeded."
      summaryProps={{ sx: { p: 0 } }}
    >
      {flags.aclpBetaServices?.alerts && (
        <AclpPreferenceToggle
          isAclpBetaLocal={isAclpAlertsBetaLocalCreateFlow}
          setIsAclpBetaLocal={setIsAclpBetaLocalCreateFlow}
          type="alerts"
        />
      )}
      {flags.aclpBetaServices?.alerts && isAclpAlertsBetaLocalCreateFlow ? (
        <Notice variant="info">ACLP Alerts coming soon...</Notice>
      ) : (
        <LinodeSettingsAlertsPanel />
      )}
    </Accordion>
  );
};
