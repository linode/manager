import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { LinodeSettingsDeletePanel } from './LinodeSettingsDeletePanel';
import { LinodeSettingsLabelPanel } from './LinodeSettingsLabelPanel';
import { LinodeSettingsMaintenancePolicyPanel } from './LinodeSettingsMaintenancePolicyPanel';
import { LinodeSettingsPasswordPanel } from './LinodeSettingsPasswordPanel';
import { LinodeWatchdogPanel } from './LinodeWatchdogPanel';

const LinodeSettings = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const { data: permissions } = usePermissions(
    'linode',
    ['update_linode', 'delete_linode'],
    id
  );

  return (
    <>
      <LinodeSettingsLabelPanel
        isReadOnly={!permissions.update_linode}
        linodeId={id}
      />
      <LinodeSettingsPasswordPanel linodeId={id} />
      {isVMHostMaintenanceEnabled && (
        <LinodeSettingsMaintenancePolicyPanel
          isReadOnly={!permissions.update_linode}
          linodeId={id}
        />
      )}
      <LinodeWatchdogPanel
        isReadOnly={!permissions.update_linode}
        linodeId={id}
      />
      <LinodeSettingsDeletePanel
        isReadOnly={!permissions.delete_linode}
        linodeId={id}
      />
    </>
  );
};

export default LinodeSettings;
