import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { CloudPulseMetricsRoute } from './CloudPulseMetricsRoute';

const cloudPulseMetricsRoute = createRoute({
  component: CloudPulseMetricsRoute,
  getParentRoute: () => rootRoute,
  path: 'metrics',
});

const cloudPulseMetricsLandingRoute = createRoute({
  getParentRoute: () => cloudPulseMetricsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/CloudPulse/Dashboard/CloudPulseDashboardLanding').then(
    (m) => m.cloudPulseMetricsLandingLazyRoute
  )
);

export const cloudPulseMetricsRouteTree = cloudPulseMetricsRoute.addChildren([
  cloudPulseMetricsLandingRoute,
]);
