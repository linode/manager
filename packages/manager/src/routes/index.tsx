import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { NotFound } from 'src/components/NotFound';

import { accountRouteTree } from './account';
import { domainsRouteTree } from './domains';
import { linodesRouteTree } from './linodes';
import { nodeBalancersRouteTree } from './nodeBalancers';
import { placementGroupsRouteTree } from './placementGroups';
import { rootRoute } from './root';
import { volumesRouteTree } from './volumes';

const indexRoute = createRoute({
  beforeLoad: ({ context }) => {
    // TODO: TanStackRouter - fix this `any` type
    const { accountSettings } = context as any;
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
  linodesRouteTree,
  nodeBalancersRouteTree,
  placementGroupsRouteTree,
  volumesRouteTree,
]);

export const router = createRouter({
  context: {
    accountSettings: undefined,
    isACLPEnabled: false,
    isDatabasesEnabled: false,
    isPlacementGroupsEnabled: false,
    selfServeBetas: false,
  },
  defaultNotFoundComponent: () => <NotFound />,
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    // This infers the type of our router and registers it across the entire project
    router: typeof router;
  }
}
