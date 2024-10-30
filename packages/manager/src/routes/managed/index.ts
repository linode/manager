import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ManagedRoute } from './ManagedRoute';

const managedRoute = createRoute({
  component: ManagedRoute,
  getParentRoute: () => rootRoute,
  path: 'managed',
});

const managedIndexRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Managed/ManagedLanding').then(
    (m) => m.managedLandingLazyRoute
  )
);

const managedSummaryRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'summary',
}).lazy(() =>
  import('src/features/Managed/ManagedLanding').then(
    (m) => m.managedLandingLazyRoute
  )
);

const managedMonitorsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'monitors',
}).lazy(() =>
  import('src/features/Managed/ManagedLanding').then(
    (m) => m.managedLandingLazyRoute
  )
);

const managedSSHAccessRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'ssh-access',
}).lazy(() =>
  import('src/features/Managed/ManagedLanding').then(
    (m) => m.managedLandingLazyRoute
  )
);

const managedCredentialsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'credentials',
}).lazy(() =>
  import('src/features/Managed/ManagedLanding').then(
    (m) => m.managedLandingLazyRoute
  )
);

const managedContactsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'contacts',
}).lazy(() =>
  import('src/features/Managed/ManagedLanding').then(
    (m) => m.managedLandingLazyRoute
  )
);

export const managedRouteTree = managedRoute.addChildren([
  managedIndexRoute,
  managedSummaryRoute,
  managedMonitorsRoute,
  managedSSHAccessRoute,
  managedCredentialsRoute,
  managedContactsRoute,
]);
