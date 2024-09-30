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

export const longviewDetailRoute = createRoute({
  component: LongviewDetail,
  getParentRoute: () => longviewRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'clients/$id',
});

export const longviewRouteTree = longviewRoute.addChildren([
  longviewLandingRoute,
  longviewDetailRoute,
]);
