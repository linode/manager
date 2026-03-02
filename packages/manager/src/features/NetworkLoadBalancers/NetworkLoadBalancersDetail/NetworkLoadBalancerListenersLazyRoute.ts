import { createLazyRoute } from '@tanstack/react-router';

import NetworkLoadBalancersDetail from './NetworkLoadBalancersDetail';

export const networkLoadBalancerListenersLazyRoute = createLazyRoute(
  '/netloadbalancers/$id/listeners'
)({
  component: NetworkLoadBalancersDetail,
});
