import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { NotFound } from 'src/components/NotFound';

import { accountRouteTree } from './account';
import { betaRouteTree } from './betas';
import { cloudPulseRouteTree } from './cloudPulse';
import { databasesRouteTree } from './databases';
import { domainsRouteTree } from './domains';
import { eventsRouteTree } from './events';
import { firewallsRouteTree } from './firewalls';
import { imagesRouteTree } from './images';
import { kubernetesRouteTree } from './kubernetes';
import { linodesRouteTree } from './linodes';
import { longviewRouteTree } from './longview';
import { managedRouteTree } from './managed';
import { nodeBalancersRouteTree } from './nodeBalancers';
import { objectStorageRouteTree } from './object-storage';
import { placementGroupsRouteTree } from './placementGroups';
import { profileRouteTree } from './profile';
import { rootRoute } from './root';
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
  cloudPulseRouteTree,
  databasesRouteTree,
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
