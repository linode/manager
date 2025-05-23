import { useGrants, useLinodeQuery, usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from '../LinodeSettings/LinodeSettingsAlertsPanel';

const LinodeAlerts = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const flags = useFlags();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(id);
  const { data: isAclpAlertsPreferenceBeta } = usePreferences(
    (preferences) => preferences?.isAclpAlertsBeta
  );

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  return (
    <Box>
      {flags.aclpIntegration ? <AclpPreferenceToggle type="alerts" /> : null}
      {flags.aclpIntegration && isAclpAlertsPreferenceBeta ? (
        // Beta ACLP Alerts View
        <AlertReusableComponent
          entityId={linodeId}
          entityName={linode?.label ?? ''}
          serviceType="linode"
        />
      ) : (
        // Legacy Alerts View
        <LinodeSettingsAlertsPanel isReadOnly={isReadOnly} linodeId={id} />
      )}
    </Box>
  );
};

export default LinodeAlerts;
