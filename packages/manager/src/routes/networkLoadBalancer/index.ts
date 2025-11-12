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
        nlbId: params.nlbId,
      },
      to: '/netloadbalancers/$nlbId/listeners',
    });
  },
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$nlbId',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

// TODO: Update to the lazy route for listeners when implemented
const networkLoadBalancerListenersRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$nlbId/listeners',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

// TODO: Update to the lazy route for nodes when implemented
const networkLoadBalancerListenerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        nlbId: params.nlbId,
        listenerId: params.listenerId,
      },
      to: '/netloadbalancers/$nlbId/listeners/$listenerId/nodes',
    });
  },
  getParentRoute: () => networkLoadBalancerListenersRoute,
  path: '$listenerId',
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
