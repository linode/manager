import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

interface Props {
  hostname: string;
  region: string;
}

export const BucketMetricsPanel = ({ hostname, region }: Props) => {
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={6}
      region={region}
      resource={hostname}
    />
  );
};
