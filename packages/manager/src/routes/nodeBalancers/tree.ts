import {
  nodeBalancerDeleteRoute,
  nodeBalancerDetailConfigurationRoute,
  nodeBalancerDetailConfigurationsRoute,
  nodeBalancerDetailRootRoute,
  nodeBalancerDetailRoute,
  nodeBalancerDetailSettingsAddFirewallRoute,
  nodeBalancerDetailSettingsDeleteRoute,
  nodeBalancerDetailSettingsRoute,
  nodeBalancerDetailSettingsUnassignFirewallRoute,
  nodeBalancerDetailSummaryRoute,
  nodeBalancersCreateRoute,
  nodeBalancersIndexRoute,
  nodeBalancersRoute,
} from '.';

export const nodeBalancersRouteTree = nodeBalancersRoute.addChildren([
  nodeBalancersIndexRoute.addChildren([nodeBalancerDeleteRoute]),
  nodeBalancersCreateRoute,
  nodeBalancerDetailRoute.addChildren([
    nodeBalancerDetailRootRoute,
    nodeBalancerDetailSummaryRoute,
    nodeBalancerDetailConfigurationsRoute.addChildren([
      nodeBalancerDetailConfigurationRoute,
    ]),
    nodeBalancerDetailSettingsRoute.addChildren([
      nodeBalancerDetailSettingsDeleteRoute,
      nodeBalancerDetailSettingsAddFirewallRoute,
      nodeBalancerDetailSettingsUnassignFirewallRoute,
    ]),
  ]),
]);
