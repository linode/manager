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
    'src/features/NetworkLoadBalancers/NetworkLoadBalancersLanding/networkLoadBalancersLazyRoute'
  ).then((m) => m.networkLoadBalancersLazyRoute)
);

const networkLoadBalancerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        id: Number(params.id),
      },
      to: '/netloadbalancers/$id/listeners',
    });
  },
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id',
});

const networkLoadBalancerListenersRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id/listeners',
  params: {
    parse: ({ id }) => ({
      id: Number(id),
    }),
  },
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/NetworkLoadBalancersDetail/NetworkLoadBalancerDetailLazyRoute'
  ).then((m) => m.networkLoadBalancerDetailLazyRoute)
);

const networkLoadBalancerListenerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        id: Number(params.id),
        listenerId: Number(params.listenerId),
      },
      to: '/netloadbalancers/$id/listeners/$listenerId/nodes',
    });
  },
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id/listeners/$listenerId',
});

const networkLoadBalancerNodesRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  params: {
    parse: ({ id, listenerId }) => ({
      id: Number(id),
      listenerId: Number(listenerId),
    }),
  },
  path: '$id/listeners/$listenerId/nodes',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/NetworkLoadBalancersDetail/NetworkLoadBalancersListenerDetail/NetworkLoadBalancersListenerDetailLazyRoutes'
  ).then((m) => m.NetworkLoadBalancersListenerDetailLazyRoute)
);

export const networkLoadBalancersRouteTree =
  networkLoadBalancersRoute.addChildren([
    networkLoadBalancersIndexRoute,
    networkLoadBalancerDetailRoute,
    networkLoadBalancerListenersRoute,
    networkLoadBalancerListenerDetailRoute,
    networkLoadBalancerNodesRoute,
  ]);
