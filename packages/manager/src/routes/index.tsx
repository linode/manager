import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { NotFound } from 'src/components/NotFound';

import { accountRouteTree } from './account';
import { domainsRouteTree } from './domains';
import { eventsRouteTree } from './events';
import { kubernetesRouteTree } from './kubernetes';
import { linodesRouteTree } from './linodes';
import { longviewRouteTree } from './longview';
import { managedRouteTree } from './managed';
import { nodeBalancersRouteTree } from './nodeBalancers';
import { objectStorageRouteTree } from './object-storage';
import { placementGroupsRouteTree } from './placementGroups';
import { profileRouteTree } from './profile';
import { rootRoute } from './root';
import { stackScriptsRouteTree } from './stackscripts';
import { supportRouteTree } from './support';
import { volumesRouteTree } from './volumes';

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
  domainsRouteTree,
  eventsRouteTree,
  kubernetesRouteTree,
  linodesRouteTree,
  longviewRouteTree,
  managedRouteTree,
  nodeBalancersRouteTree,
  objectStorageRouteTree,
  placementGroupsRouteTree,
  profileRouteTree,
  stackScriptsRouteTree,
  supportRouteTree,
  volumesRouteTree,
]);

export const router = createRouter({
  context: {},
  defaultNotFoundComponent: () => <NotFound />,
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    // This infers the type of our router and registers it across the entire project
    router: typeof router;
  }
}
