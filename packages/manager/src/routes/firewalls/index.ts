import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { FirewallsRoute } from './FirewallsRoute';

import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';

const firewallsRoute = createRoute({
  component: FirewallsRoute,
  getParentRoute: () => rootRoute,
  path: 'firewalls',
});

const firewallsIndexRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '/',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallLandingLazyRoute)
);

const firewallCreateRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: 'create',
  validateSearch: (
    search?: LinodeCreateQueryParams
  ): Partial<LinodeCreateQueryParams> => search ?? {},
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallLandingLazyRoute)
);

const firewallDetailRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  params: {
    parse: ({ id }: { id: string }) => ({
      id: Number(id),
    }),
    stringify: ({ id }: { id: number }) => ({
      id: String(id),
    }),
  },
  path: '$id',
  validateSearch: (search: { tab?: string }) => search,
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/rules',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailLinodesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/linodes',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailNodebalancersRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/nodebalancers',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

export const firewallsRouteTree = firewallsRoute.addChildren([
  firewallsIndexRoute,
  firewallDetailRoute.addChildren([
    firewallDetailLinodesRoute,
    firewallDetailRulesRoute,
    firewallDetailNodebalancersRoute,
  ]),
  firewallCreateRoute,
]);
