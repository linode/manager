import { createRoute } from '@tanstack/react-router';

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
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancersLandingLazyRoute
  )
);

const nodeBalancersCreateRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: 'create',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then((m) => m.nodeBalancerCreateLazyRoute)
);

const nodeBalancerDetailRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '$id',
  params: {
    parse: (params) => ({
      id: Number(params.id),
    }),
  },
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then((m) => m.nodeBalancerDetailLazyRoute)
);

const nodeBalancerDetailRootRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: '/',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancerSummaryLazyRoute
  )
);

const nodeBalancerDetailSummaryRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'summary',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancerSummaryLazyRoute
  )
);

const nodeBalancerDetailConfigurationsRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'configurations',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancerConfigurationsLazyRoute
  )
);

const nodeBalancerDetailConfigurationRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailConfigurationsRoute,
  path: '$configId',
  params: {
    parse: ({ configId }) => {
      return { configId: Number(configId) };
    },
  },
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancerConfigurationsLazyRoute
  )
);

const nodeBalancerDetailSettingsRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: 'settings',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodebalancerSettingsLazyRoute
  )
);

const nodeBalancerDetailSettingsDeleteRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailSettingsRoute,
  path: '/delete',
});

const nodeBalancerDetailSettingsAddFirewallRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailSettingsRoute,
  path: '/add-firewall',
});

const nodeBalancerDetailSettingsUnassignFirewallRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailSettingsRoute,
  path: '/unassign-firewall/$firewallId',
  params: {
    parse: ({ firewallId }) => {
      return { firewallId: Number(firewallId) };
    },
  },
});

const nodeBalancerDeleteRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '$id/delete',
  params: {
    parse: ({ id }) => {
      return { id: Number(id) };
    },
  },
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancersLandingLazyRoute
  )
);

export const nodeBalancersRouteTree = nodeBalancersRoute.addChildren([
  nodeBalancersIndexRoute.addChildren([nodeBalancerDeleteRoute]),
  nodeBalancersCreateRoute,
  nodeBalancerDetailRoute.addChildren([
    nodeBalancerDetailRootRoute,
    nodeBalancerDetailSummaryRoute,
    nodeBalancerDetailConfigurationsRoute.addChildren([
      nodeBalancerDetailConfigurationRoute,
    ]),
    nodeBalancerDetailSettingsRoute.addChildren([
      nodeBalancerDetailSettingsDeleteRoute,
      nodeBalancerDetailSettingsAddFirewallRoute,
      nodeBalancerDetailSettingsUnassignFirewallRoute,
    ]),
  ]),
]);
