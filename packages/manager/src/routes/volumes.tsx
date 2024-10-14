import { Outlet, createRoute } from '@tanstack/react-router';
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

export const volumesRouteTree = volumesRoute.addChildren([
  volumesIndexRoute,
  volumesCreateRoute,
]);
