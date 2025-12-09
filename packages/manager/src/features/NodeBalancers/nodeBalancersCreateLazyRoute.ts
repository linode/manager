import { createLazyRoute } from '@tanstack/react-router';

import NodeBalancerCreate from 'src/features/NodeBalancers/NodeBalancerCreate';

export const nodeBalancerCreateLazyRoute = createLazyRoute(
  '/nodebalancers/create'
)({
  component: NodeBalancerCreate,
});
