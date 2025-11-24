import { createLazyRoute } from '@tanstack/react-router';

import NetworkLoadBalancersDetail from './NetworkLoadBalancersDetail';

export const networkLoadBalancerDetailLazyRoute = createLazyRoute(
  '/netloadbalancers/$id'
)({
  component: NetworkLoadBalancersDetail,
});
