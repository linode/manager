import { createLazyRoute } from '@tanstack/react-router';

import LinodeMetrics from './LinodeMetrics';

export const linodeMetricsLazyRoute = createLazyRoute(
  '/linodes/$linodeId/metrics'
)({
  component: LinodeMetrics,
});
