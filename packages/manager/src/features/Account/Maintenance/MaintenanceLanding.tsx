import { Stack } from '@linode/ui';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { MaintenanceTable } from './MaintenanceTable';

const MaintenanceLanding = () => {
  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="Maintenance" />
      <MaintenanceTable type="pending" />
      <MaintenanceTable type="completed" />
    </Stack>
  );
};

export default MaintenanceLanding;
