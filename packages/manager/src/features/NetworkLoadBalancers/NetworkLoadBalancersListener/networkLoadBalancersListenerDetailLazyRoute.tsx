import { createLazyRoute } from '@tanstack/react-router';

import NetworkLoadBalancersListenerDetail from './NetworkLoadBalancersListenerDetail';

export const networkLoadBalancersListenerDetailLazyRoute = createLazyRoute(
  '/netloadbalancers/$id/listeners/$listenerId'
)({
  component: NetworkLoadBalancersListenerDetail,
});
