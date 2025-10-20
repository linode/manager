import { createLazyRoute } from '@tanstack/react-router';

import { VolumeMetrics } from './VolumeMetrics';

export const volumeMetricsLazyRoute = createLazyRoute(
  '/volumes/$volumeId/metrics'
)({
  component: VolumeMetrics,
});
