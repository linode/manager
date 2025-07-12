import { createLazyRoute } from '@tanstack/react-router';

import { NodeBalancersLanding } from 'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding';

export const nodeBalancersLandingLazyRoute = createLazyRoute('/nodebalancers')({
  component: NodeBalancersLanding,
});
