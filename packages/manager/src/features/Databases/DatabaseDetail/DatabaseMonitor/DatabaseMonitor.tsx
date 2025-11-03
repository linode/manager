import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

import { useDatabaseDetailContext } from '../DatabaseDetailContext';

export const DatabaseMonitor = () => {
  const navigate = useNavigate();
  const { database, engine, isMonitorEnabled } = useDatabaseDetailContext();
  const databaseId = database?.id;
  const serviceType = 'dbaas';

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
      resource={databaseId}
      serviceType={serviceType}
    />
  );
};
