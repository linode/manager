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
  getParentRoute: () => nodeBalancersRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding'
  ).then((m) => m.NodeBalancersLandingLazyRoute)
);

const nodeBalancersCreateRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/NodeBalancers/NodeBalancerCreate').then(
    (m) => m.NodeBalancerCreateLazyRoute
  )
);

const nodeBalancerDetailRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  parseParams: (params) => ({
    nodeBalancerId: Number(params.nodeBalancerId),
  }),
  path: '$nodeBalancerId',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail'
  ).then((m) => m.NodeBalancerDetailLazyRoute)
);

const nodeBalancerDetailSummaryRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'summary',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary'
  ).then((m) => m.NodeBalancerSummaryLazyRoute)
);

// TODO TanStack Router - figure proper way of lazy loading class components
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
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'settings',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettings'
  ).then((m) => m.NodeBalancerSettingsLazyRoute)
);

export const nodeBalancersRouteTree = nodeBalancersRoute.addChildren([
  nodeBalancersIndexRoute,
  nodeBalancersCreateRoute,
  nodeBalancerDetailRoute.addChildren([
    nodeBalancerDetailSummaryRoute,
    nodeBalancerDetailConfigurationsRoute,
    nodeBalancerDetailSettingsRoute,
  ]),
]);
