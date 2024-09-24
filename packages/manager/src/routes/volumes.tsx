import {
  Outlet,
  createRoute,
  lazyRouteComponent,
} from '@tanstack/react-router';
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

export const volumesRoute = createRoute({
  component: VolumesRoutes,
  getParentRoute: () => rootRoute,
  path: 'volumes',
});

export const volumesIndexRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Volumes/VolumesLanding').then((module) => ({
      default: module.VolumesLanding,
    }))
  ),
  getParentRoute: () => volumesRoute,
  path: '/',
});

export const volumesCreateRoute = createRoute({
  component: lazyRouteComponent(() =>
    import('src/features/Volumes/VolumeCreate').then((module) => ({
      default: module.VolumeCreate,
    }))
  ),
  getParentRoute: () => volumesRoute,
  path: 'create',
});
