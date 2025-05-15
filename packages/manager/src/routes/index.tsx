import { NotFound } from '@linode/ui';
import { QueryClient } from '@tanstack/react-query';
import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { ErrorComponent } from 'src/features/ErrorBoundary/ErrorComponent';
import { tagsRoutes } from 'src/features/Tags/routes';

import { accountRouteTree } from './account';
import { cloudPulseAlertsRouteTree } from './alerts';
import { betaRouteTree } from './betas';
import { databasesRouteTree } from './databases';
import { dataStreamRouteTree } from './datastream';
import { domainsRouteTree } from './domains';
import { eventsRouteTree } from './events';
import { firewallsRouteTree } from './firewalls';
import { imagesRouteTree } from './images';
import { kubernetesRouteTree } from './kubernetes';
import { linodesRouteTree } from './linodes';
import { longviewRouteTree } from './longview';
import { managedRouteTree } from './managed';
import { cloudPulseMetricsRouteTree } from './metrics';
import { nodeBalancersRouteTree } from './nodeBalancers';
import { objectStorageRouteTree } from './objectStorage';
import { placementGroupsRouteTree } from './placementGroups';
import { profileRouteTree } from './profile';
import { migrationRootRoute, rootRoute } from './root';
import { searchRouteTree } from './search';
import { stackScriptsRouteTree } from './stackscripts';
import { supportRouteTree } from './support';
import { volumesRouteTree } from './volumes';
import { vpcsRouteTree } from './vpcs';

const indexRoute = createRoute({
  beforeLoad: ({ context }) => {
    const { accountSettings } = context;
    const defaultRoot = accountSettings?.managed ? '/managed' : '/linodes';
    throw redirect({ to: defaultRoot });
  },
  getParentRoute: () => rootRoute,
  path: '/',
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  accountRouteTree,
  betaRouteTree,
  cloudPulseAlertsRouteTree,
  cloudPulseMetricsRouteTree,
  databasesRouteTree,
  dataStreamRouteTree,
  domainsRouteTree,
  eventsRouteTree,
  firewallsRouteTree,
  imagesRouteTree,
  kubernetesRouteTree,
  linodesRouteTree,
  longviewRouteTree,
  managedRouteTree,
  nodeBalancersRouteTree,
  objectStorageRouteTree,
  placementGroupsRouteTree,
  profileRouteTree,
  searchRouteTree,
  stackScriptsRouteTree,
  supportRouteTree,
  volumesRouteTree,
  vpcsRouteTree,
  tagsRoutes,
]);

export const router = createRouter({
  context: {
    queryClient: new QueryClient(),
  },
  defaultNotFoundComponent: () => <NotFound />,
  defaultPreload: 'intent',
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    // This infers the type of our router and registers it across the entire project
    router: typeof router;
  }
}

/**
 * This is the router that is used to handle the migration to TanStack Router.
 * It is currently set to the migration router in order to incrementally migrate the app to the new routing.
 * This is a temporary solution until we are ready to fully migrate to TanStack Router.
 * Eventually we will only use the router exported above.
 */
export const migrationRouteTree = migrationRootRoute.addChildren([
  betaRouteTree,
  domainsRouteTree,
  dataStreamRouteTree,
  firewallsRouteTree,
  imagesRouteTree,
  longviewRouteTree,
  managedRouteTree,
  nodeBalancersRouteTree,
  objectStorageRouteTree,
  placementGroupsRouteTree,
  stackScriptsRouteTree,
  volumesRouteTree,
  tagsRoutes,
  vpcsRouteTree,
]);

export type MigrationRouteTree = typeof migrationRouteTree;

export const migrationRouter = createRouter({
  context: {
    queryClient: new QueryClient(),
  },
  defaultNotFoundComponent: () => <NotFound />,
  defaultPreload: 'intent',
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorComponent error={error} eventId={error.name} resetError={reset} />
  ),
  routeTree: migrationRouteTree,
});
