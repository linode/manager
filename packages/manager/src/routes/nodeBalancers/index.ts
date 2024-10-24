import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { NodeBalancersRoute } from './NodeBalancersRoute';

const nodeBalancersRoute = createRoute({
  component: NodeBalancersRoute,
  getParentRoute: () => rootRoute,
  path: 'nodebalancers',
});

const nodeBalancersIndexRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding'
  ).then((m) => m.nodeBalancersLandingLazyRoute)
);

const nodeBalancersCreateRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/NodeBalancers/NodeBalancerCreate').then(
    (m) => m.nodeBalancerCreateLazyRoute
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
  ).then((m) => m.nodeBalancerDetailLazyRoute)
);

const nodeBalancerDetailSummaryRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'summary',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary'
  ).then((m) => m.nodeBalancerSummaryLazyRoute)
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
  ).then((m) => m.nodeBalancerSettingsLazyRoute)
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
