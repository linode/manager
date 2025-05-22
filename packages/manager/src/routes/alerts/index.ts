import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { CloudPulseAlertsRoute } from './CloudPulseAlertsRoute';

const cloudPulseAlertsRoute = createRoute({
  component: CloudPulseAlertsRoute,
  getParentRoute: () => rootRoute,
  path: 'alerts',
});

const cloudPulseAlertsLandingRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/CloudPulse/Alerts/AlertsLanding/AlertsLanding').then(
    (m) => m.cloudPulseAlertsLandingLazyRoute
  )
);

export const cloudPulseAlertsRouteTree = cloudPulseAlertsRoute.addChildren([
  cloudPulseAlertsLandingRoute,
]);
