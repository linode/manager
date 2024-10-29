import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { FirewallsRoute } from './FirewallsRoute';

const firewallsRoute = createRoute({
  component: FirewallsRoute,
  getParentRoute: () => rootRoute,
  path: 'firewalls',
});

const firewallsIndexRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Firewalls/FirewallLanding/FirewallLanding').then(
    (m) => m.firewallLandingLazyRoute
  )
);

const firewallCreateRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Firewalls/FirewallLanding/FirewallLanding').then(
    (m) => m.firewallLandingLazyRoute
  )
);

const firewallDetailRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.firewallDetailLazyRoute
  )
);

const firewallDetailRulesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/rules',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.firewallDetailLazyRoute
  )
);

const firewallDetailLinodesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/linodes',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.firewallDetailLazyRoute
  )
);

const firewallDetailNodebalancersRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/nodebalancers',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.firewallDetailLazyRoute
  )
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
