import { useGrants, useLinodeQuery, usePreferences } from '@linode/queries';
import { Box } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import { LinodeSettingsAlertsPanel } from '../LinodeSettings/LinodeSettingsAlertsPanel';

interface Props {
  isAclpAlertsSupportedRegionLinode: boolean;
}

const LinodeAlerts = (props: Props) => {
  const { isAclpAlertsSupportedRegionLinode } = props;
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
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
      {flags.aclpBetaServices?.alerts && isAclpAlertsSupportedRegionLinode && (
        <AclpPreferenceToggle type="alerts" />
      )}

      {flags.aclpBetaServices?.alerts &&
      isAclpAlertsSupportedRegionLinode &&
      isAclpAlertsPreferenceBeta ? (
        // Beta ACLP Alerts View
        <AlertReusableComponent
          entityId={linodeId.toString()}
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
