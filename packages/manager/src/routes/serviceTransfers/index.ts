import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ServiceTransfersRoute } from './ServiceTransfersRoute';

const serviceTransfersRoute = createRoute({
  component: ServiceTransfersRoute,
  getParentRoute: () => rootRoute,
  path: 'service-transfers',
});

// Catch all route for service-transfers page
const serviceTransfersCatchAllRoute = createRoute({
  getParentRoute: () => serviceTransfersRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/service-transfers' });
  },
});

// Index route: /service-transfers (main service-transfers content)
const serviceTransfersIndexRoute = createRoute({
  getParentRoute: () => serviceTransfersRoute,
  path: '/',
}).lazy(() =>
  import('src/features/ServiceTransfers/serviceTransfersLandingLazyRoute').then(
    (m) => m.serviceTransfersLandingLazyRoute
  )
);

const serviceTransfersCreateRoute = createRoute({
  getParentRoute: () => serviceTransfersRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/ServiceTransfers/serviceTransfersCreateLazyRoute').then(
    (m) => m.serviceTransfersCreateLazyRoute
  )
);

export const serviceTransfersRouteTree = serviceTransfersRoute.addChildren([
  serviceTransfersIndexRoute,
  serviceTransfersCatchAllRoute,
  serviceTransfersCreateRoute,
]);
