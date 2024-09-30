import { Outlet, createRoute } from '@tanstack/react-router';
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

const linodesIndexRoute = createRoute({
  getParentRoute: () => linodesRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Linodes/index').then((m) => m.LinodesLandingLazyRoute)
);

const linodesCreateRoute = createRoute({
  getParentRoute: () => linodesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Linodes/LinodeCreatev2').then(
    (m) => m.LinodeCreatev2LazyRoute
  )
);

const linodesDetailRoute = createRoute({
  getParentRoute: () => linodesRoute,
  parseParams: (params) => ({
    linodeId: Number(params.linodeId),
  }),
  path: '$linodeId',
}).lazy(() =>
  import('src/features/Linodes/LinodesDetail/LinodesDetail').then(
    (m) => m.LinodeDetailLazyRoute
  )
);

export const linodesRouteTree = linodesRoute.addChildren([
  linodesIndexRoute,
  linodesCreateRoute,
  linodesDetailRoute,
]);
