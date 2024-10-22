import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { CloudPulseRoutes } from './CloudPulseRoute';

const cloudPulseRoute = createRoute({
  component: CloudPulseRoutes,
  getParentRoute: () => rootRoute,
  path: 'monitor/cloudpulse',
});

const cloudPulseLandingRoute = createRoute({
  getParentRoute: () => cloudPulseRoute,
  path: '/',
}).lazy(() =>
  import('src/features/CloudPulse/CloudPulseLanding').then(
    (m) => m.cloudPulseLandingLazyRoute
  )
);

export const cloudPulseRouteTree = cloudPulseRoute.addChildren([
  cloudPulseLandingRoute,
]);
