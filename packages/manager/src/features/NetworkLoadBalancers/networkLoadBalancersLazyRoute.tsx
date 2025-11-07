import { createLazyRoute } from '@tanstack/react-router';

import { NetworkLoadBalancersLanding } from './NetworkLoadBalancersLanding';

export const networkLoadBalancersLazyRoute = createLazyRoute('/betas')({
  component: NetworkLoadBalancersLanding,
});
