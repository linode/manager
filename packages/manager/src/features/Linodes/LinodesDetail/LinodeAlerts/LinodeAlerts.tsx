
import { useLinodeQuery } from '@linode/queries';
import { Box } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import { AlertsPanel } from './AlertsPanel';

interface Props {
  isAclpAlertsSupportedRegionLinode: boolean;
  isAlertsBetaMode: boolean;
  onAlertsModeChange: (isBeta: boolean) => void;
}

const LinodeAlerts = (props: Props) => {
  const {
    onAlertsModeChange,
    isAlertsBetaMode,
    isAclpAlertsSupportedRegionLinode,
  } = props;
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { aclpBetaServices } = useFlags();
  const { data: linode } = useLinodeQuery(id);

  const { permissions } = usePermissions('linode', ['update_linode'], id);

  return (
    <Box>
      {aclpBetaServices?.linode?.alerts &&
        isAclpAlertsSupportedRegionLinode && (
          <AclpPreferenceToggle
            isAlertsBetaMode={isAlertsBetaMode}
            onAlertsModeChange={onAlertsModeChange}
            type="alerts"
          />
        )}

      {aclpBetaServices?.linode?.alerts &&
      isAclpAlertsSupportedRegionLinode &&
      isAlertsBetaMode ? (
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
