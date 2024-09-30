import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const FirewallsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Firewalls" />
      <Outlet />
    </React.Suspense>
  );
};

const firewallsRoute = createRoute({
  component: FirewallsRoutes,
  getParentRoute: () => rootRoute,
  path: 'firewalls',
});

const firewallsIndexRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Firewalls/FirewallLanding/FirewallLanding').then(
    (m) => m.FirewallLandingLazyRoute
  )
);

const firewallCreateRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Firewalls/FirewallLanding/FirewallLanding').then(
    (m) => m.FirewallLandingLazyRoute
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
    (m) => m.FirewallDetailLazyRoute
  )
);

const firewallDetailRulesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/rules',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.FirewallDetailLazyRoute
  )
);

const firewallDetailLinodesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/linodes',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.FirewallDetailLazyRoute
  )
);

const firewallDetailNodebalancersRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/nodebalancers',
}).lazy(() =>
  import('src/features/Firewalls/FirewallDetail/index').then(
    (m) => m.FirewallDetailLazyRoute
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
