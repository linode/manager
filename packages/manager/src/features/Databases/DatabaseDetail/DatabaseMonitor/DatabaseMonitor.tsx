import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

import { useDatabaseDetailContext } from '../DatabaseDetailContext';

export const DatabaseMonitor = () => {
  const navigate = useNavigate();
  const { database, engine, isMonitorEnabled } = useDatabaseDetailContext();
  const databaseId = database?.id;
  const dbaasDashboardId = 1;

  if (!isMonitorEnabled) {
    navigate({
      to: `/databases/$engine/$databaseId/summary`,
      params: {
        engine,
        databaseId,
      },
    });
    return null;
  }

  return (
    <CloudPulseDashboardWithFilters
      dashboardId={dbaasDashboardId}
      resource={databaseId}
    />
  );
};
