import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import MaintenanceTable from './MaintenanceTable';

const MaintenanceLanding: React.FC<{}> = () => (
  <React.Fragment>
    <DocumentTitleSegment segment="Maintenance" />
    <MaintenanceTable type="Linode" />;
  </React.Fragment>
);

export default MaintenanceLanding;
