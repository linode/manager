import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { LongviewDetail } from 'src/features/Longview/LongviewDetail/LongviewDetail';

import { rootRoute } from './root';

export const LongviewRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Longview" />
      <Outlet />
    </React.Suspense>
  );
};

export const longviewRoute = createRoute({
  component: LongviewRoutes,
  getParentRoute: () => rootRoute,
  path: 'longview',
});

export const longviewLandingRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/LongviewLanding').then(
    (m) => m.longviewLandingLazyRoute
  )
);

export const longviewLandingClientsRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: 'clients',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/LongviewLanding').then(
    (m) => m.longviewLandingLazyRoute
  )
);

export const longviewLandingPlanDetailsRoute = createRoute({
  getParentRoute: () => longviewRoute,
  path: 'plan-details',
}).lazy(() =>
  import('src/features/Longview/LongviewLanding/LongviewLanding').then(
    (m) => m.longviewLandingLazyRoute
  )
);

export const longviewDetailRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'clients/$id',
});

export const longviewDetailOverviewRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewDetailRoute,
  path: 'overview',
});

export const longviewDetailProcessesRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewDetailRoute,
  path: 'processes',
});

export const longviewDetailNetworkRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewDetailRoute,
  path: 'network',
});

export const longviewDetailDisksRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewDetailRoute,
  path: 'disks',
});

export const longviewDetailInstallationRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewDetailRoute,
  path: 'installation',
});

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
