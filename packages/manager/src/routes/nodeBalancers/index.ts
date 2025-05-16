import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { NodeBalancersRoute } from './NodeBalancersRoute';

export const nodeBalancersRoute = createRoute({
  component: NodeBalancersRoute,
  getParentRoute: () => rootRoute,
  path: 'nodebalancers',
});

export const nodeBalancersIndexRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding'
  ).then((m) => m.nodeBalancersLandingLazyRoute)
);

export const nodeBalancersCreateRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/NodeBalancers/NodeBalancerCreate').then(
    (m) => m.nodeBalancerCreateLazyRoute
  )
);

export const nodeBalancerDetailRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '$id',
  params: {
    parse: ({ id }) => {
      return { id: Number(id) };
    },
  },
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail'
  ).then((m) => m.nodeBalancerDetailLazyRoute)
);

export const nodeBalancerDetailRootRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary'
  ).then((m) => m.nodeBalancerSummaryLazyRoute)
);

export const nodeBalancerDetailSummaryRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: '/summary',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary'
  ).then((m) => m.nodeBalancerSummaryLazyRoute)
);

export const nodeBalancerDetailConfigurationsRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: '/configurations',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerConfigurationsWrapper'
  ).then((m) => m.nodeBalancerConfigurationsLazyRoute)
);

export const nodeBalancerDetailConfigurationRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailConfigurationsRoute,
  path: '$configId',
  params: {
    parse: ({ configId }) => {
      return { configId: Number(configId) };
    },
  },
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerConfigurationsWrapper'
  ).then((m) => m.nodeBalancerConfigurationsLazyRoute)
);

export const nodeBalancerDetailSettingsRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailRoute,
  path: '/settings',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettings'
  ).then((m) => m.nodeBalancerSettingsLazyRoute)
);

export const nodeBalancerDetailSettingsDeleteRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailSettingsRoute,
  path: 'delete',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettingsDeleteDialog'
  ).then((m) => m.nodeBalancerDetailSettingsDeleteRoute)
);

export const nodeBalancerDetailSettingsAddFirewallRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailSettingsRoute,
  path: 'add-firewall',
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerAddFirewallDrawer'
  ).then((m) => m.nodeBalancerSettingsAddFirewallLazyRoute)
);

export const nodeBalancerDetailSettingsUnassignFirewallRoute = createRoute({
  getParentRoute: () => nodeBalancerDetailSettingsRoute,
  path: 'unassign-firewall/$firewallId',
  params: {
    parse: ({ firewallId }) => {
      return { firewallId: Number(firewallId) };
    },
  },
}).lazy(() =>
  import(
    'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerUnassignFirewallDialog'
  ).then((m) => m.nodeBalancerSettingsUnassignFirewallLazyRoute)
);

export const nodeBalancerDeleteRoute = createRoute({
  getParentRoute: () => nodeBalancersIndexRoute,
  path: '$id/delete',
  params: {
    parse: ({ id }) => ({ id: Number(id) }),
  },
}).lazy(() =>
  import('src/features/NodeBalancers/NodeBalancerLandingDeleteDialog').then(
    (m) => m.nodeBalancerLandingDeleteLazyRoute
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
