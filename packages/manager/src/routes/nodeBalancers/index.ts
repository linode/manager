import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';

import { rootRoute } from '../root';
import { NodeBalancersRoute } from './NodeBalancersRoute';

const nodeBalancersRoute = createRoute({
  component: NodeBalancersRoute,
  getParentRoute: () => rootRoute,
  path: 'nodebalancers',
});

const nodeBalancersIndexRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '/',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then(
    (m) => m.nodeBalancersLandingLazyRoute
  )
);

const nodeBalancersCreateRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: 'create',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then((m) => m.nodeBalancerCreateLazyRoute)
);

const nodeBalancerDetailRoute = createRoute({
  beforeLoad: async ({ params }) => {
    throw redirect({
      params: {
        id: params.id,
      },
      to: '/nodebalancers/$id/summary',
    });
  },
  getParentRoute: () => nodeBalancersRoute,
  path: '$id',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then((m) => m.nodeBalancerDetailLazyRoute)
);

const nodeBalancerDetailSummaryRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '$id/summary',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then((m) => m.nodeBalancerDetailLazyRoute)
);

// TODO TanStack Router - figure proper way of lazy loading class components
const nodeBalancerDetailConfigurationsRoute = createRoute({
  component: lazyRouteComponent(
    () =>
      import(
        'src/features/NodeBalancers/NodeBalancerDetail/NodeBalancerConfigurations'
      )
  ),
  getParentRoute: () => nodeBalancersRoute,
  path: '$id/configurations',
});

const nodeBalancerDetailSettingsRoute = createRoute({
  getParentRoute: () => nodeBalancersRoute,
  path: '$id/settings',
}).lazy(() =>
  import('./nodeBalancersLazyRoutes').then((m) => m.nodeBalancerDetailLazyRoute)
);

export const nodeBalancersRouteTree = nodeBalancersRoute.addChildren([
  nodeBalancersIndexRoute,
  nodeBalancersCreateRoute,
  nodeBalancerDetailRoute.addChildren([
    nodeBalancerDetailSummaryRoute,
    nodeBalancerDetailConfigurationsRoute,
    nodeBalancerDetailSettingsRoute,
  ]),
]);
