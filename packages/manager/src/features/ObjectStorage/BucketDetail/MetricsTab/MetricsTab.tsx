import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

interface Props {
  bucketName: string;
  clusterId: string;
}

export const MetricsTab = ({ bucketName, clusterId }: Props) => {
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={6}
      region={clusterId}
      resource={bucketName}
    />
  );
};
