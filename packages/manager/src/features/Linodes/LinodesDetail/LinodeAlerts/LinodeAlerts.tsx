import { useGrants, useLinodeQuery } from '@linode/queries';
import { Box } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';
import { useFlags } from 'src/hooks/useFlags';

import { AclpPreferenceToggle } from '../../AclpPreferenceToggle';
import { AlertsPanel } from './AlertsPanel';

interface Props {
  isAclpAlertsSupportedRegionLinode: boolean;
  isAclpBetaLocal: boolean;
  setIsAclpBetaLocal: (value: boolean) => void;
}

const LinodeAlerts = (props: Props) => {
  const {
    isAclpAlertsSupportedRegionLinode,
    isAclpBetaLocal,
    setIsAclpBetaLocal,
  } = props;
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { aclpBetaServices } = useFlags();
  const { data: grants } = useGrants();
  const { data: linode } = useLinodeQuery(id);

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  return (
    <Box>
      {aclpBetaServices?.linode?.alerts &&
        isAclpAlertsSupportedRegionLinode && (
          <AclpPreferenceToggle
            isAclpBetaLocal={isAclpBetaLocal}
            setIsAclpBetaLocal={setIsAclpBetaLocal}
            type="alerts"
          />
        )}

      {aclpBetaServices?.linode?.alerts &&
      isAclpAlertsSupportedRegionLinode &&
      isAclpBetaLocal ? (
        // Beta ACLP Alerts View
        <AlertReusableComponent
          entityId={linodeId.toString()}
          entityName={linode?.label ?? ''}
          serviceType="linode"
        />
      ) : (
        // Legacy Alerts View
        <AlertsPanel isReadOnly={isReadOnly} linodeId={id} />
      )}
    </Box>
  );
};

export default LinodeAlerts;
