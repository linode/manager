import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

interface Props {
  hostname: string;
  region: string;
}

export const MetricsTab = ({ hostname, region }: Props) => {
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={6}
      region={region}
      resource={hostname}
    />
  );
};
