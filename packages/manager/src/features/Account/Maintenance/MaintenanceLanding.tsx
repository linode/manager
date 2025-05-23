import { Stack } from '@linode/ui';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useFlags } from 'src/hooks/useFlags';

import { MaintenanceTable } from './MaintenanceTable';

const MaintenanceLanding = () => {
  const flags = useFlags();

  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="Maintenance" />
      {flags.vmHostMaintenance?.enabled ? (
        <>
          {' '}
          <MaintenanceTable type="in progress" />
          <MaintenanceTable type="scheduled" />{' '}
        </>
      ) : (
        <MaintenanceTable type="pending" />
      )}

      <MaintenanceTable type="completed" />
    </Stack>
  );
};

export default MaintenanceLanding;
