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
});

const networkLoadBalancerListenersRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$nlbId/listeners',
});

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
});

const networkLoadBalancerNodesRoute = createRoute({
  getParentRoute: () => networkLoadBalancerListenersRoute,
  path: '$listenerId/nodes',
});

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
