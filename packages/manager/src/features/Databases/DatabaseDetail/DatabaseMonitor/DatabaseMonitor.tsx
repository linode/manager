import * as React from 'react';
import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { Database } from '@linode/api-v4';

interface Props {
  database: Database;
}

export const DatabaseMonitor = ({ database }: Props) => {
  const databaseId = database?.id;
  const dbaasDashboardId = 1;
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={dbaasDashboardId}
      resource={databaseId}
    />
  );
};
