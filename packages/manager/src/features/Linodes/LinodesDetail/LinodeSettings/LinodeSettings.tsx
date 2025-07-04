import { useGrants } from '@linode/queries';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';

import { LinodeSettingsDeletePanel } from './LinodeSettingsDeletePanel';
import { LinodeSettingsLabelPanel } from './LinodeSettingsLabelPanel';
import { LinodeSettingsMaintenancePolicyPanel } from './LinodeSettingsMaintenancePolicyPanel';
import { LinodeSettingsPasswordPanel } from './LinodeSettingsPasswordPanel';
import { LinodeWatchdogPanel } from './LinodeWatchdogPanel';

const LinodeSettings = () => {
  const { linodeId } = useParams({ from: '/linodes/$linodeId' });
  const id = Number(linodeId);

  const { data: grants } = useGrants();

  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  return (
    <>
      <LinodeSettingsLabelPanel isReadOnly={isReadOnly} linodeId={id} />
      <LinodeSettingsPasswordPanel isReadOnly={isReadOnly} linodeId={id} />
      {isVMHostMaintenanceEnabled && (
        <LinodeSettingsMaintenancePolicyPanel
          isReadOnly={isReadOnly}
          linodeId={id}
        />
      )}
      <LinodeWatchdogPanel isReadOnly={isReadOnly} linodeId={id} />
      <LinodeSettingsDeletePanel isReadOnly={isReadOnly} linodeId={id} />
    </>
  );
};

export default LinodeSettings;
