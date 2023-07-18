import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import { MaintenanceTable } from './MaintenanceTable';

const MaintenanceLanding = () => {
  return (
    <>
      <DocumentTitleSegment segment="Maintenance" />
      <MaintenanceTable type="pending" />
      <MaintenanceTable type="completed" />
    </>
  );
};

export default MaintenanceLanding;
