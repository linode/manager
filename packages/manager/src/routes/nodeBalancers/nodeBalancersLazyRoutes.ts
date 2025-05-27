import { createLazyRoute } from '@tanstack/react-router';

import NodeBalancerCreate from 'src/features/NodeBalancers/NodeBalancerCreate';
import { NodeBalancerConfigurationsWrapper } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerConfigurationWrapper';
import { NodeBalancerDetail } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail';
import { NodeBalancerSettings } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettings';
import { NodeBalancerSummary } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary';
import { NodeBalancersLanding } from 'src/features/NodeBalancers/NodeBalancersLanding/NodeBalancersLanding';

export const nodeBalancersLandingLazyRoute = createLazyRoute('/nodebalancers')({
  component: NodeBalancersLanding,
});

export const nodeBalancerDetailLazyRoute = createLazyRoute(
  '/nodebalancers/$id'
)({
  component: NodeBalancerDetail,
});

export const nodeBalancerSummaryLazyRoute = createLazyRoute(
  '/nodebalancers/$id'
)({
  component: NodeBalancerSummary,
});

export const nodeBalancerConfigurationsLazyRoute = createLazyRoute(
  '/nodebalancers/$id/configurations'
)({
  component: NodeBalancerConfigurationsWrapper,
});

export const nodebalancerSettingsLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings'
)({
  component: NodeBalancerSettings,
});

export const nodeBalancerCreateLazyRoute = createLazyRoute(
  '/nodebalancers/create'
)({
  component: NodeBalancerCreate,
});
