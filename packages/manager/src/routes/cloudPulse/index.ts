import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { CloudPulseRoute } from './CloudPulseRoute';

const cloudPulseRoute = createRoute({
  component: CloudPulseRoute,
  getParentRoute: () => rootRoute,
  path: 'monitor',
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
