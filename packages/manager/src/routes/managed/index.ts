import { createRoute, redirect } from '@tanstack/react-router';

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
  beforeLoad: () => {
    throw redirect({ to: '/managed/summary' });
  },
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

const managedMonitorsDeleteRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ monitorId }: { monitorId: string }) => ({
      monitorId: Number(monitorId),
    }),
    stringify: ({ monitorId }: { monitorId: number }) => ({
      monitorId: String(monitorId),
    }),
  },
  path: '/monitors/$monitorId/delete',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedSSHAccessRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'ssh-access',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedSSHAccessEditRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ linodeId }: { linodeId: string }) => ({
      linodeId: Number(linodeId),
    }),
    stringify: ({ linodeId }: { linodeId: number }) => ({
      linodeId: String(linodeId),
    }),
  },
  path: 'ssh-access/$linodeId/edit',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedCredentialsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'credentials',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedCredentialsAddRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'credentials/add',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedCredentialsEditRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ credentialId }: { credentialId: string }) => ({
      credentialId: Number(credentialId),
    }),
    stringify: ({ credentialId }: { credentialId: number }) => ({
      credentialId: String(credentialId),
    }),
  },
  path: 'credentials/$credentialId/edit',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedCredentialsDeleteRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ credentialId }: { credentialId: string }) => ({
      credentialId: Number(credentialId),
    }),
    stringify: ({ credentialId }: { credentialId: number }) => ({
      credentialId: String(credentialId),
    }),
  },
  path: 'credentials/$credentialId/delete',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedContactsRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'contacts',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedContactsAddRoute = createRoute({
  getParentRoute: () => managedRoute,
  path: 'contacts/add',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedContactsEditRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ contactId }: { contactId: string }) => ({
      contactId: Number(contactId),
    }),
    stringify: ({ contactId }: { contactId: number }) => ({
      contactId: String(contactId),
    }),
  },
  path: 'contacts/$contactId/edit',
}).lazy(() =>
  import('./managedLazyRoutes').then((m) => m.managedLandingLazyRoute)
);

const managedContactsDeleteRoute = createRoute({
  getParentRoute: () => managedRoute,
  params: {
    parse: ({ contactId }: { contactId: string }) => ({
      contactId: Number(contactId),
    }),
    stringify: ({ contactId }: { contactId: number }) => ({
      contactId: String(contactId),
    }),
  },
  path: 'contacts/$contactId/delete',
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
  managedMonitorsDeleteRoute,
  managedSSHAccessRoute,
  managedSSHAccessEditRoute,
  managedCredentialsRoute,
  managedCredentialsAddRoute,
  managedCredentialsEditRoute,
  managedCredentialsDeleteRoute,
  managedContactsRoute,
  managedContactsAddRoute,
  managedContactsEditRoute,
  managedContactsDeleteRoute,
]);
