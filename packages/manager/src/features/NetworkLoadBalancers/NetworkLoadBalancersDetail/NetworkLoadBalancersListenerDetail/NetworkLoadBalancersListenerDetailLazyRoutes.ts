import { createLazyRoute } from '@tanstack/react-router';

import { NetworkLoadBalancersListenerDetail } from './NetworkLoadBalancersListenerDetail';

export const NetworkLoadBalancersListenerDetailLazyRoute = createLazyRoute(
  '/netloadbalancers/$id/listeners/$listenerId'
)({
  component: NetworkLoadBalancersListenerDetail,
});
