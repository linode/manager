import {
  Outlet,
  createRoute,
  lazyRouteComponent,
} from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

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

export const linodesIndexRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Linodes').then((module) => ({
      default: module.LinodesLandingWrapper,
    }))
  ),
  getParentRoute: () => linodesRoute,
  path: '/',
});

export const linodesCreateRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Linodes/LinodeCreatev2').then((module) => ({
      default: module.LinodeCreatev2,
    }))
  ),
  getParentRoute: () => linodesRoute,
  path: 'create',
});

export const linodesDetailRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
      (module) => ({
        default: module.LinodeDetail,
      })
    )
  ),
  getParentRoute: () => linodesRoute,
  parseParams: (params) => ({
    linodeId: Number(params.linodeId),
  }),
  path: '$linodeId',
});
