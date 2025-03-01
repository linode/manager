import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { FirewallsRoute } from './FirewallsRoute';

import type { TableSearchParams } from '../types';
import type { LinodeCreateType } from 'src/features/Linodes/LinodeCreate/types';

export interface FirewallsSearchParams extends TableSearchParams {
  type?: LinodeCreateType;
}

const firewallsRoute = createRoute({
  component: FirewallsRoute,
  getParentRoute: () => rootRoute,
  path: 'firewalls',
});

const firewallsIndexRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '/',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallLandingLazyRoute)
);

const firewallCreateRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: 'create',
  validateSearch: (search: FirewallsSearchParams) => search,
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallLandingLazyRoute)
);

const firewallDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: { id: String(params.id) },
      to: '/firewalls/$id/rules',
    });
  },
  getParentRoute: () => firewallsRoute,
  params: {
    parse: ({ id }: { id: string }) => ({
      id: Number(id),
    }),
    stringify: ({ id }: { id: number }) => ({
      id: String(id),
    }),
  },
  path: '$id',
  validateSearch: (search: { tab?: string }) => search,
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/rules',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesAddRuleRoute = createRoute({
  getParentRoute: () => firewallDetailRulesRoute,
  path: 'add',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesEditInboundRuleRoute = createRoute({
  getParentRoute: () => firewallDetailRulesRoute,
  path: 'edit/inbound/$ruleId',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesEditOutboundRuleRoute = createRoute({
  getParentRoute: () => firewallDetailRulesRoute,
  path: 'edit/outbound/$ruleId',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesAddInboundRuleRoute = createRoute({
  getParentRoute: () => firewallDetailRulesAddRuleRoute,
  path: 'inbound',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailRulesAddOutboundRuleRoute = createRoute({
  getParentRoute: () => firewallDetailRulesAddRuleRoute,
  path: 'outbound',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailLinodesRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/linodes',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailLinodesAddLinodeRoute = createRoute({
  getParentRoute: () => firewallDetailLinodesRoute,
  path: 'add',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailLinodesRemoveLinodeRoute = createRoute({
  getParentRoute: () => firewallDetailLinodesRoute,
  path: 'remove',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailNodebalancersRoute = createRoute({
  getParentRoute: () => firewallsRoute,
  path: '$id/nodebalancers',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailNodebalancersAddNodebalancerRoute = createRoute({
  getParentRoute: () => firewallDetailNodebalancersRoute,
  path: 'add',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

const firewallDetailNodebalancersRemoveNodebalancerRoute = createRoute({
  getParentRoute: () => firewallDetailNodebalancersRoute,
  path: 'remove',
}).lazy(() =>
  import('./firewallLazyRoutes').then((m) => m.firewallDetailLazyRoute)
);

export const firewallsRouteTree = firewallsRoute.addChildren([
  firewallsIndexRoute,
  firewallDetailRoute.addChildren([
    firewallDetailLinodesRoute.addChildren([
      firewallDetailLinodesAddLinodeRoute,
      firewallDetailLinodesRemoveLinodeRoute,
    ]),
    firewallDetailRulesRoute.addChildren([
      firewallDetailRulesAddRuleRoute,
      firewallDetailRulesEditInboundRuleRoute,
      firewallDetailRulesEditOutboundRuleRoute,
      firewallDetailRulesAddInboundRuleRoute,
      firewallDetailRulesAddOutboundRuleRoute,
    ]),
    firewallDetailNodebalancersRoute.addChildren([
      firewallDetailNodebalancersAddNodebalancerRoute,
      firewallDetailNodebalancersRemoveNodebalancerRoute,
    ]),
  ]),
  firewallCreateRoute,
]);
