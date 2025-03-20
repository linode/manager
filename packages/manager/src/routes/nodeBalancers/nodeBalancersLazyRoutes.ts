import { createLazyRoute } from '@tanstack/react-router';

import NodeBalancerCreate from 'src/features/NodeBalancers/NodeBalancerCreate';
import { NodeBalancerDetail } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail';
import { NodeBalancersLanding } from 'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding';

export const nodeBalancersLandingLazyRoute = createLazyRoute('/nodebalancers')({
  component: NodeBalancersLanding,
});

export const nodeBalancerDetailLazyRoute = createLazyRoute(
  '/nodebalancers/$id'
)({
  component: NodeBalancerDetail,
});

export const nodeBalancerCreateLazyRoute = createLazyRoute(
  '/nodebalancers/create'
)({
  component: NodeBalancerCreate,
});
