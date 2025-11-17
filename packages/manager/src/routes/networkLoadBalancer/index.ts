import { createRoute } from '@tanstack/react-router';

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

export const networkLoadBalancersRouteTree =
  networkLoadBalancersRoute.addChildren([networkLoadBalancersIndexRoute]);
