import * as React from 'react';

import DashboardNotifications from './DashboardNotifications';
import LinodeDashboardContent from './LinodeDashboardContent';

export const Dashboard: React.FC<{}> = props => {
  return (
    <>
      <DashboardNotifications />
      <LinodeDashboardContent />
    </>
  );
};

export default React.memo(Dashboard);
