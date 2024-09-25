import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

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
  component: strictLazyRouteComponent(() =>
    import('src/features/Volumes/VolumesLanding').then((module) => ({
      default: module.VolumesLanding,
    }))
  ),
  getParentRoute: () => volumesRoute,
  path: '/',
});

export const volumesCreateRoute = createRoute({
  component: strictLazyRouteComponent(() =>
    import('src/features/Volumes/VolumeCreate').then((module) => ({
      default: module.VolumeCreate,
    }))
  ),
  getParentRoute: () => volumesRoute,
  path: 'create',
});
