import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

import { useDatabaseDetailContext } from '../DatabaseDetailContext';

export const DatabaseMonitor = () => {
  const { database } = useDatabaseDetailContext();
  const databaseId = database?.id;
  const dbaasDashboardId = 1;

  return (
    <CloudPulseDashboardWithFilters
      dashboardId={dbaasDashboardId}
      resource={databaseId}
    />
  );
};
