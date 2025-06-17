import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { CloudPulseAlertsRoute } from './CloudPulseAlertsRoute';

const cloudPulseAlertsRoute = createRoute({
  component: CloudPulseAlertsRoute,
  getParentRoute: () => rootRoute,
  path: 'alerts',
});

const cloudPulseAlertsIndexRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/alerts/definitions' });
  },
}).lazy(() =>
  import('./cloudPulseAlertsLazyRoutes').then(
    (m) => m.cloudPulseAlertsLandingLazyRoute
  )
);

const cloudPulseAlertsDefinitionsRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: 'definitions',
}).lazy(() =>
  import('./cloudPulseAlertsLazyRoutes').then(
    (m) => m.cloudPulseAlertsLandingLazyRoute
  )
);

const cloudPulseAlertsCreateRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: 'definitions/create',
}).lazy(() =>
  import('./cloudPulseAlertsLazyRoutes').then(
    (m) => m.cloudPulseAlertsCreateLazyRoute
  )
);

const cloudPulseAlertsDefinitionsDetailRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: 'definitions/detail/$serviceType/$alertId',
}).lazy(() =>
  import('./cloudPulseAlertsLazyRoutes').then(
    (m) => m.cloudPulseAlertsDefinitionsDetailLazyRoute
  )
);

const cloudPulseAlertsDefinitionsEditRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: 'definitions/edit/$serviceType/$alertId',
}).lazy(() =>
  import('./cloudPulseAlertsLazyRoutes').then(
    (m) => m.cloudPulseAlertsDefinitionsEditLazyRoute
  )
);

const cloudPulseAlertsDefinitionsCatchAllRoute = createRoute({
  getParentRoute: () => cloudPulseAlertsRoute,
  path: 'definitions/$invalidPath',
  beforeLoad: ({ params }) => {
    // Only redirect if the path doesn't match our valid routes
    if (!['create', 'detail', 'edit'].includes(params.invalidPath)) {
      throw redirect({ to: '/alerts/definitions' });
    }
  },
});

export const cloudPulseAlertsRouteTree = cloudPulseAlertsRoute.addChildren([
  cloudPulseAlertsIndexRoute,
  cloudPulseAlertsDefinitionsRoute.addChildren([
    cloudPulseAlertsCreateRoute,
    cloudPulseAlertsDefinitionsDetailRoute,
    cloudPulseAlertsDefinitionsEditRoute,
  ]),
  cloudPulseAlertsDefinitionsCatchAllRoute,
]);
