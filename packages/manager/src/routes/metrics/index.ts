import { createRoute } from '@tanstack/react-router';

import { mainContentRoute } from '../mainContent';
import { CloudPulseMetricsRoute } from './CloudPulseMetricsRoute';

const cloudPulseMetricsRoute = createRoute({
  component: CloudPulseMetricsRoute,
  getParentRoute: () => mainContentRoute,
  path: 'metrics',
});

const cloudPulseMetricsLandingRoute = createRoute({
  getParentRoute: () => cloudPulseMetricsRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/CloudPulse/Dashboard/cloudPulseMetricsLandingLazyRoute'
  ).then((m) => m.cloudPulseMetricsLandingLazyRoute)
);

export const cloudPulseMetricsRouteTree = cloudPulseMetricsRoute.addChildren([
  cloudPulseMetricsLandingRoute,
]);
