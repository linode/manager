import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

export const VolumeMetrics = () => {
  const { volumeId } = useParams({ from: '/volumes/$volumeId' });

  const objectStorageDashboardId = 7;
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={objectStorageDashboardId}
      resource={volumeId}
    />
  );
};
