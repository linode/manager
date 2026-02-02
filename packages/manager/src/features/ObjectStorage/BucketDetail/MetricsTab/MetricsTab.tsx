import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

interface Props {
  bucketName: string;
  region: string;
}

export const MetricsTab = ({ bucketName, region }: Props) => {
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={6}
      region={region}
      resource={bucketName}
    />
  );
};
