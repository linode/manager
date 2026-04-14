import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';

export const StreamMetrics = () => {
  const { streamId } = useParams({
    from: '/logs/delivery/streams/$streamId/metrics',
  });

  return (
    <CloudPulseDashboardWithFilters resource={streamId} serviceType="logs" />
  );
};
