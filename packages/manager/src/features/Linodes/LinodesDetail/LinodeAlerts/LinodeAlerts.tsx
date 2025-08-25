import { useLinodeQuery } from '@linode/queries';
import { useIsLinodeAclpSubscribed } from '@linode/shared';
import { Box } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useIsAclpSupportedRegion } from 'src/features/CloudPulse/Utils/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import { useLinodeDetailContext } from '../LinodesDetailContext';
import { AlertsPanel } from './AlertsPanel';

const LinodeAlerts = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);
  const { isAlertsBetaMode } = useLinodeDetailContext();

  const { aclpServices } = useFlags();
  const { data: linode } = useLinodeQuery(id);

  const { data: permissions } = usePermissions({
    accessType: 'linode',
    permissionsToCheck: ['update_linode'],
    entityId: id,
  });

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'alerts',
  });
  const isLinodeAclpSubscribed = useIsLinodeAclpSubscribed(id, 'beta');

  return (
    <Box>
      {aclpServices?.linode?.alerts?.enabled &&
        isAclpAlertsSupportedRegionLinode && (
          <AclpPreferenceToggle
            isAlertsBetaMode={isAlertsBetaMode.get}
            onAlertsModeChange={isAlertsBetaMode.set}
            type="alerts"
          />
        )}
      {aclpServices?.linode?.alerts?.enabled &&
      isAclpAlertsSupportedRegionLinode &&
      isAlertsBetaMode.get ? (
        // Beta ACLP Alerts View
        <AlertReusableComponent
          entityId={linodeId.toString()}
          entityName={linode?.label ?? ''}
          isLegacyAlertAvailable={!isLinodeAclpSubscribed}
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
