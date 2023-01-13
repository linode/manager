import * as React from 'react';
import { MaintenanceTable } from './MaintenanceTable';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

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
