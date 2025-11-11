import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { NetworkLoadBalancersRoute } from './networkLoadBalancersRoute';

const networkLoadBalancersRoute = createRoute({
  component: NetworkLoadBalancersRoute,
  getParentRoute: () => rootRoute,
  path: 'netloadbalancers',
});

const networkLoadBalancersIndexRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

const networkLoadBalancerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        id: params.id,
      },
      to: '/netloadbalancers/$id/listeners',
    });
  },
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

// TODO: Update to the lazy route for listeners when implemented
const networkLoadBalancerListenersRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id/listeners',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

// TODO: Update to the lazy route for listeners when implemented
const networkLoadBalancerListenerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        id: params.id,
      },
      to: '/netloadbalancers/$id/listeners',
    });
  },
  getParentRoute: () => networkLoadBalancerListenersRoute,
  path: '$nodeId',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

// TODO: Update to the lazy route for nodes when implemented
const networkLoadBalancerNodesRoute = createRoute({
  getParentRoute: () => networkLoadBalancerListenersRoute,
  path: '$listenerId/nodes',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

export const networkLoadBalancersRouteTree =
  networkLoadBalancersRoute.addChildren([
    networkLoadBalancersIndexRoute,
    networkLoadBalancerDetailRoute.addChildren([
      networkLoadBalancerListenersRoute.addChildren([
        networkLoadBalancerListenerDetailRoute,
        networkLoadBalancerNodesRoute,
      ]),
    ]),
  ]);
