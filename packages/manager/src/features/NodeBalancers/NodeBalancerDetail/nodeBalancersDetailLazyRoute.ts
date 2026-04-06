import { createLazyRoute } from '@tanstack/react-router';

import { NodeBalancerDetail } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail';

export const nodeBalancerDetailLazyRoute = createLazyRoute(
  '/nodebalancers/$id'
)({
  component: NodeBalancerDetail,
});
