import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ManagedRoute } from './ManagedRoute';

import type { TableSearchParams } from '../types';

export interface ManagedSearchParams extends TableSearchParams {
  query?: string;
}

const managedRoute = createRoute({
  component: ManagedRoute,
  getParentRoute: () => rootRoute,
  path: 'managed',
});

const managedIndexRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: '/',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedSummaryRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'summary',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedMonitorsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'monitors',
  validateSearch: (search: ManagedSearchParams) => search,
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedMonitorsAddRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: '/monitors/add',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedMonitorsIssuesRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ monitorId }: { monitorId: string }) => ({
      monitorId: Number(monitorId),
    }),
    stringify: ({ monitorId }: { monitorId: number }) => ({
      monitorId: String(monitorId),
    }),
  },
  path: '/monitors/$monitorId/issues',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedMonitorsEditRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ monitorId }: { monitorId: string }) => ({
      monitorId: Number(monitorId),
    }),
    stringify: ({ monitorId }: { monitorId: number }) => ({
      monitorId: String(monitorId),
    }),
  },
  path: '/monitors/$monitorId/edit',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedSSHAccessRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'ssh-access',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedCredentialsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'credentials',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedContactsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'contacts',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

export const managedRouteTree = managedRoute.addChildren([
  managedIndexRoute,
  managedSummaryRoute,
  managedMonitorsRoute,
  managedMonitorsAddRoute,
  managedMonitorsIssuesRoute,
  managedMonitorsEditRoute,
  managedSSHAccessRoute,
  managedCredentialsRoute,
  managedContactsRoute,
]);
