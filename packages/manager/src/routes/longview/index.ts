import { createRoute, redirect } from '@tanstack/react-router';

import { mainContentRoute } from '../mainContent';
import { LongviewRoute } from './LongviewRoute';

const longviewRoute = createRoute({
  component: LongviewRoute,
  getParentRoute: () => mainContentRoute,
  path: 'longview',
});

const longviewLandingRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ to: '/longview/clients' });
  },
  getParentRoute: () => longviewRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/longviewLandingLazyRoute').then(
    (m) => m.longviewLandingLazyRoute
  )
);

const longviewLandingClientsRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: 'clients',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/longviewLandingLazyRoute').then(
    (m) => m.longviewLandingLazyRoute
  )
);

const longviewLandingPlanDetailsRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: 'plan-details',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/longviewLandingLazyRoute').then(
    (m) => m.longviewLandingLazyRoute
  )
);

const longviewDetailRoute = createRoute({
  getParentRoute: () => longviewRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'clients/$id',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailOverviewRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'overview',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailProcessesRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'processes',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailNetworkRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'network',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailDisksRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'disks',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailInstallationRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'installation',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailApacheRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'apache',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailNginxRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'nginx',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailMySQLRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'mysql',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/longviewDetailLazyRoute').then(
    (m) => m.longviewDetailLazyRoute
  )
);

export const longviewRouteTree = longviewRoute.addChildren([
  longviewLandingRoute,
  longviewLandingClientsRoute,
  longviewLandingPlanDetailsRoute,
  longviewDetailRoute.addChildren([
    longviewDetailOverviewRoute,
    longviewDetailProcessesRoute,
    longviewDetailNetworkRoute,
    longviewDetailDisksRoute,
    longviewDetailInstallationRoute,
    longviewDetailApacheRoute,
    longviewDetailNginxRoute,
    longviewDetailMySQLRoute,
  ]),
]);
