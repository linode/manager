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
        id: params.id,
      },
      to: '/netloadbalancers/$id/listeners',
    });
  },
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/NetworkLoadBalancersDetail/NetworkLoadBalancerDetailLazyRoute'
  ).then((m) => m.networkLoadBalancerDetailLazyRoute)
);

const networkLoadBalancerListenersRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '$id/listeners',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/NetworkLoadBalancersDetail/NetworkLoadBalancerDetailLazyRoute'
  ).then((m) => m.networkLoadBalancerDetailLazyRoute)
);

const networkLoadBalancerListenerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        id: params.id,
        listenerId: params.listenerId,
      },
      to: '/netloadbalancers/$id/listeners/$listenerId/nodes',
    });
  },
  getParentRoute: () => networkLoadBalancersRoute,
  path: '/$id/listeners/$listenerId',
}).lazy(() =>
  import(
    'src/features/NetworkLoadBalancers/NetworkLoadBalancersDetail/NetworkLoadBalancersListenerDetail/NetworkLoadBalancersListenerDetailLazyRoutes'
  ).then((m) => m.NetworkLoadBalancersListenerDetailLazyRoute)
);

const networkLoadBalancerNodesRoute = createRoute({
  getParentRoute: () => networkLoadBalancersRoute,
  path: '/$id/listeners/$listenerId/nodes',
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
