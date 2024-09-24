import { createRoute, createRouter, redirect } from '@tanstack/react-router';
import React from 'react';

import { NotFound } from 'src/components/NotFound';

import {
  accountBillingEditRoute,
  accountBillingRoute,
  accountEntityTransfersCreateRoute,
  accountIndexRoute,
  accountInvoicesInvoiceIdRoute,
  accountRoute,
  accountUsersUsernameRoute,
} from './account';
import {
  linodesCreateRoute,
  linodesDetailRoute,
  linodesIndexRoute,
  linodesRoute,
} from './linodes';
import {
  placementGroupsCreateRoute,
  placementGroupsDeleteRoute,
  placementGroupsDetailRoute,
  placementGroupsEditRoute,
  placementGroupsIndexRoute,
  placementGroupsRoute,
  placementGroupsUnassignRoute,
} from './placementGroups';
import { rootRoute } from './root';
import { volumesCreateRoute, volumesIndexRoute, volumesRoute } from './volumes';

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  accountRoute.addChildren([
    accountIndexRoute,
    accountUsersUsernameRoute,
    accountBillingRoute.addChildren([
      accountBillingEditRoute,
      accountInvoicesInvoiceIdRoute,
    ]),
    accountEntityTransfersCreateRoute,
  ]),
  linodesRoute.addChildren([
    linodesIndexRoute,
    linodesCreateRoute,
    linodesDetailRoute,
  ]),
  placementGroupsRoute.addChildren([
    placementGroupsIndexRoute,
    placementGroupsCreateRoute,
    placementGroupsEditRoute,
    placementGroupsDeleteRoute,
    placementGroupsDetailRoute,
    placementGroupsUnassignRoute,
  ]),
  volumesRoute.addChildren([volumesIndexRoute, volumesCreateRoute]),
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
