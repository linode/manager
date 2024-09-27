import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(
    () => import('src/features/Firewalls/FirewallLanding/FirewallLanding')
  ),
  getParentRoute: () => firewallsRoute,
  path: '/',
});

const firewallDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Firewalls/FirewallDetail'),
    'FirewallDetail'
  ),
  getParentRoute: () => firewallsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id',
});

const firewallCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Firewalls/FirewallLanding/FirewallLanding')
  ),
  getParentRoute: () => firewallsRoute,
  path: 'create',
});

const firewallDetailRulesRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import(
        'src/features/Firewalls/FirewallDetail/Rules/FirewallRulesLanding'
      ),
    'FirewallRulesLanding'
  ),
  getParentRoute: () => firewallDetailRoute,
  path: 'rules',
});

const firewallDetailLinodesRoute = createRoute({
  component: strictLazyRouteComponent(() =>
    import(
      'src/features/Firewalls/FirewallDetail/Devices/FirewallDeviceLanding'
    ).then((module) => ({
      default: module.FirewallDeviceLanding,
    }))
  ),
  getParentRoute: () => firewallDetailRoute,
  path: 'linodes',
});

const firewallDetailNodebalancersRoute = createRoute({
  component: strictLazyRouteComponent(() =>
    import(
      'src/features/Firewalls/FirewallDetail/Devices/FirewallDeviceLanding'
    ).then((module) => ({
      default: module.FirewallDeviceLanding,
    }))
  ),
  getParentRoute: () => firewallDetailRoute,
  path: 'nodebalancers',
});

export const firewallsRouteTree = firewallsRoute.addChildren([
  firewallsIndexRoute,
  firewallDetailRoute.addChildren([
    firewallDetailLinodesRoute,
    firewallDetailRulesRoute,
    firewallDetailNodebalancersRoute,
  ]),
  firewallCreateRoute,
]);
