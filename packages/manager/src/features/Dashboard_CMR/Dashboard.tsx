import * as React from 'react';

import DashboardNotifications from './DashboardNotifications';
import LinodeDashboardContent from './LinodeDashboardContent';

export const Dashboard: React.FC<{}> = _ => {
  return (
    <>
      <DashboardNotifications />
      <LinodeDashboardContent />
    </>
  );
};

export default React.memo(Dashboard);
