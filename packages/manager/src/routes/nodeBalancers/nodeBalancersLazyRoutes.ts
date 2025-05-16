import { createLazyRoute } from '@tanstack/react-router';

import NodeBalancerCreate from 'src/features/NodeBalancers/NodeBalancerCreate';
import { NodeBalancerAddFirewallDrawer } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerAddFirewallDrawer';
import {
  NodeBalancerConfigurationWrapper,
  NodeBalancerDetail,
} from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerDetail';
import { NodeBalancerSettings } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettings';
import { NodeBalancerSettingsDeleteDialog } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSettingsDeleteDialog';
import { NodeBalancerSummary } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerSummary/NodeBalancerSummary';
import { NodeBalancerUnassignFirewallDialog } from 'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerUnassignFirewallDialog';
import { NodeBalancerLandingDeleteDialog } from 'src/features/NodeBalancers/NodeBalancerLandingDeleteDialog';
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
  '/nodebalancers/$id/summary'
)({
  component: NodeBalancerSummary,
});

export const nodeBalancerConfigurationsLazyRoute = createLazyRoute(
  '/nodebalancers/$id/configurations'
)({
  component: NodeBalancerConfigurationWrapper,
});

export const nodeBalancerSettingsLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings'
)({
  component: NodeBalancerSettings,
});

export const nodeBalancerSettingsDeleteLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings/delete'
)({
  component: NodeBalancerSettingsDeleteDialog,
});

export const nodeBalancerLandingDeleteLazyRoute = createLazyRoute(
  '/nodebalancers/$id/delete'
)({
  component: NodeBalancerLandingDeleteDialog,
});

export const nodeBalancerSettingsAddFirewallLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings/add-firewall'
)({
  component: NodeBalancerAddFirewallDrawer,
});

export const nodeBalancerSettingsUnassignFirewallLazyRoute = createLazyRoute(
  '/nodebalancers/$id/settings/unassign-firewall/$firewallId'
)({
  component: NodeBalancerUnassignFirewallDialog,
});

export const nodeBalancerCreateLazyRoute = createLazyRoute(
  '/nodebalancers/create'
)({
  component: NodeBalancerCreate,
});
