import { useLinodeQuery, useRegionsQuery } from '@linode/queries';
import { Box } from '@linode/ui';
import { isAclpSupportedRegion } from '@linode/utilities';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import { useLinodeDetailContext } from '../LinodesDetailContext';
import { AlertsPanel } from './AlertsPanel';

const LinodeAlerts = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);
  const { isAlertsBetaMode } = useLinodeDetailContext();

  const { aclpBetaServices } = useFlags();
  const { data: linode } = useLinodeQuery(id);
  const { data: regions } = useRegionsQuery();

  const { permissions } = usePermissions('linode', ['update_linode'], id);

  const isAclpAlertsSupportedRegionLinode = isAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    regions,
    type: 'alerts',
  });

  return (
    <Box>
      {aclpBetaServices?.linode?.alerts &&
        isAclpAlertsSupportedRegionLinode && (
          <AclpPreferenceToggle
            isAlertsBetaMode={isAlertsBetaMode.get}
            onAlertsModeChange={isAlertsBetaMode.set}
            type="alerts"
          />
        )}
      {aclpBetaServices?.linode?.alerts &&
      isAclpAlertsSupportedRegionLinode &&
      isAlertsBetaMode.get ? (
        // Beta ACLP Alerts View
        <AlertReusableComponent
          entityId={linodeId.toString()}
          entityName={linode?.label ?? ''}
          serviceType="linode"
        />
      ) : (
        // Legacy Alerts View
        <AlertsPanel isReadOnly={!permissions.update_linode} linodeId={id} />
      )}
    </Box>
  );
};

export default LinodeAlerts;
