import {
  Outlet,
  createRoute,
  lazyRouteComponent,
} from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const NodeBalancersRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="NodeBalancers" />
      <Outlet />
    </React.Suspense>
  );
};

const nodeBalancersRoute = createRoute({
  component: NodeBalancersRoutes,
  getParentRoute: () => rootRoute,
  path: 'nodebalancers',
});

const nodeBalancersIndexRoute = createRoute({
  component: lazyRouteComponent(
    () =>
      import(
        'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding'
      )
  ),
  getParentRoute: () => nodeBalancersRoute,
  path: '/',
});

const nodeBalancersCreateRoute = createRoute({
  component: lazyRouteComponent(
    () => import('src/features/NodeBalancers/NodeBalancerCreate')
  ),
  getParentRoute: () => nodeBalancersRoute,
  path: 'create',
});

const nodeBalancerDetailRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail'
    ).then((module) => ({
      default: module.NodeBalancerDetail,
    }))
  ),
  getParentRoute: () => nodeBalancersRoute,
  parseParams: (params) => ({
    nodeBalancerId: Number(params.nodeBalancerId),
  }),
  path: '$nodeBalancerId',
});

const nodeBalancerDetailSummaryRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary'
    ).then((module) => ({
      default: module.NodeBalancerSummary,
    }))
  ),
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'summary',
});

const nodeBalancerDetailConfigurationsRoute = createRoute({
  component: lazyRouteComponent(
    () =>
      import(
        'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerConfigurations'
      )
  ),
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'configurations',
});

const nodeBalancerDetailSettingsRoute = createRoute({
  component: lazyRouteComponent(() =>
    import(
      'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettings'
    ).then((module) => ({
      default: module.NodeBalancerSettings,
    }))
  ),
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'settings',
});

export const nodeBalancersRouteTree = nodeBalancersRoute.addChildren([
  nodeBalancersIndexRoute,
  nodeBalancersCreateRoute,
  nodeBalancerDetailRoute.addChildren([
    nodeBalancerDetailSummaryRoute,
    nodeBalancerDetailConfigurationsRoute,
    nodeBalancerDetailSettingsRoute,
  ]),
]);
