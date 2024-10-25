import { Outlet, createRoute, redirect } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const VolumesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Volumes" />
      <Outlet />
    </React.Suspense>
  );
};

const volumesRoute = createRoute({
  component: VolumesRoutes,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

const volumesIndexRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '/',
  validateSearch: (search: { page: number; query: string | undefined }) => {
    return {
      page: search.page ?? 1,
      // pageSize: search.pageSize ? Number(search.pageSize) : undefined,
      query: search.query,
    };
  },
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCreateRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Volumes/VolumeCreate').then(
    (m) => m.volumeCreateLazyRoute
  )
);

const volumeEditRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/edit',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeDetailsRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/details',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeResizeRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/resize',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeCloneRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/clone',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeAttachRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/attach',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeDetachRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/detach',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeUpgradeRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/upgrade',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumeDeleteRoute = createRoute({
  getParentRoute: () => volumesRoute,
  path: '$volumeId/delete',
  parseParams: (params) => ({
    volumeId: Number(params.volumeId),
  }),
}).lazy(() =>
  import('src/features/Volumes/VolumesLanding').then(
    (m) => m.volumesLandingLazyRoute
  )
);

const volumesCatchAllRoute = createRoute({
  beforeLoad: () => {
    throw redirect({
      to: '/volumes',
      search: {
        page: 1,
        query: '',
      },
    });
  },
  getParentRoute: () => volumesRoute,
  path: '*',
});

export const volumesRouteTree = volumesRoute.addChildren([
  volumesIndexRoute.addChildren([
    volumeEditRoute,
    volumeDetailsRoute,
    volumeResizeRoute,
    volumeCloneRoute,
    volumeAttachRoute,
    volumeDetachRoute,
    volumeUpgradeRoute,
    volumeDeleteRoute,
  ]),
  volumesCreateRoute,
  volumesCatchAllRoute,
]);
