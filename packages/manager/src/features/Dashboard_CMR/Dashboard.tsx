import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import DashboardNotifications from './DashboardNotifications';
import LinodeDashboardContent from './LinodeDashboardContent';

export const Dashboard: React.FC<{}> = _ => {
  return (
    <>
      <DocumentTitleSegment segment="Dashboard" />
      <DashboardNotifications />
      <LinodeDashboardContent />
    </>
  );
};

export default React.memo(Dashboard);
