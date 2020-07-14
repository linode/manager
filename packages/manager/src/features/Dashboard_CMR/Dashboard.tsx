import * as React from 'react';

import DashboardNotifications from './DashboardNotifications';

export const Dashboard: React.FC<{}> = props => {
  return (
    <>
      <DashboardNotifications />
    </>
  );
};

export default React.memo(Dashboard);
