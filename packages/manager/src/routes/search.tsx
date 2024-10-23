import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { StatusBanners } from 'src/features/Help/StatusBanners';

import { rootRoute } from './root';

export const SearchRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <StatusBanners />
      <Outlet />
    </React.Suspense>
  );
};

const searchRoute = createRoute({
  component: SearchRoutes,
  getParentRoute: () => rootRoute,
  path: 'search',
});

const searchLandingRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Search/SearchLanding').then(
    (m) => m.searchLandingLazyRoute
  )
);

export const searchRouteTree = searchRoute.addChildren([searchLandingRoute]);
