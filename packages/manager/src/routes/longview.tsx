import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const LongviewRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Longview" />
      <Outlet />
    </React.Suspense>
  );
};

const longviewRoute = createRoute({
  component: LongviewRoutes,
  getParentRoute: () => rootRoute,
  path: 'longview',
});

const longviewLandingRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/LongviewLanding').then(
    (m) => m.longviewLandingLazyRoute
  )
);

const longviewLandingClientsRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: 'clients',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/LongviewLanding').then(
    (m) => m.longviewLandingLazyRoute
  )
);

const longviewLandingPlanDetailsRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: 'plan-details',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/LongviewLanding').then(
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
  import('src/features/Longview/LongviewDetail/LongviewDetail').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailOverviewRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'overview',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/LongviewDetail').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailProcessesRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'processes',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/LongviewDetail').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailNetworkRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'network',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/LongviewDetail').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailDisksRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'disks',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/LongviewDetail').then(
    (m) => m.longviewDetailLazyRoute
  )
);

const longviewDetailInstallationRoute = createRoute({
  getParentRoute: () => longviewDetailRoute,
  path: 'installation',
}).lazy(() =>
  import('src/features/Longview/LongviewDetail/LongviewDetail').then(
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
  ]),
]);
