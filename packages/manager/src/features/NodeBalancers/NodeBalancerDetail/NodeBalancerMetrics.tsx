import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

export const NodeBalancerMetrics = () => {
  const { id } = useParams({ from: '/nodebalancers/$id/metrics' });

  const nodeBalancerDashboardId = 3;
  return (
    <CloudPulseDashboardWithFilters
      dashboardId={nodeBalancerDashboardId}
      resource={id}
    />
  );
};
