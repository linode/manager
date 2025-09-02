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

  const { data: permissions } = usePermissions('linode', ['update_linode'], id);

  const isAclpAlertsSupportedRegionLinode = useIsAclpSupportedRegion({
    capability: 'Linodes',
    regionId: linode?.region,
    type: 'alerts',
  });
  const isLinodeAclpSubscribed = useIsLinodeAclpSubscribed(id, 'beta');

  return (
    <Box>
      {(
          <AclpPreferenceToggle
            isAlertsBetaMode={isAlertsBetaMode.get}
            onAlertsModeChange={isAlertsBetaMode.set}
            type="alerts"
          />
        )}
      {(
        // Beta ACLP Alerts View
        <AlertReusableComponent
          entityId={linodeId.toString()}
          entityName={linode?.label ?? ''}
          isLegacyAlertAvailable={!isLinodeAclpSubscribed}
          serviceType="linode"
        />
      )}
    </Box>
  );
};

export default LinodeAlerts;
