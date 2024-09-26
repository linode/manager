import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(
    () => import('src/features/Longview/LongviewLanding/LongviewLanding'),
    'LongviewLanding'
  ),
  getParentRoute: () => longviewRoute,
  path: '/',
});

export const longviewDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Longview/LongviewDetail/LongviewDetail'),
    'LongviewDetail'
  ),
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
