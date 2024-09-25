import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const LinodesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Outlet />
    </React.Suspense>
  );
};

export const linodesRoute = createRoute({
  component: LinodesRoutes,
  getParentRoute: () => rootRoute,
  path: 'linodes',
});

const linodesIndexRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Linodes'),
    'LinodesLandingWrapper'
  ),
  getParentRoute: () => linodesRoute,
  path: '/',
});

const linodesCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Linodes/LinodeCreatev2'),
    'LinodeCreatev2'
  ),
  getParentRoute: () => linodesRoute,
  path: 'create',
});

const linodesDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Linodes/LinodesDetail/LinodesDetail'),
    'LinodeDetail'
  ),
  getParentRoute: () => linodesRoute,
  parseParams: (params) => ({
    linodeId: Number(params.linodeId),
  }),
  path: '$linodeId',
});

export const linodesRouteTree = linodesRoute.addChildren([
  linodesIndexRoute,
  linodesCreateRoute,
  linodesDetailRoute,
]);
