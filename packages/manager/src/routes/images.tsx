import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const ImagesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Images" />
      <Outlet />
    </React.Suspense>
  );
};

export const imagesRoute = createRoute({
  component: ImagesRoutes,
  getParentRoute: () => rootRoute,
  path: 'images',
});

export const imagesIndexRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Images/ImagesLanding/ImagesLanding'),
    'ImagesLanding'
  ),
  getParentRoute: () => imagesRoute,
  path: '/',
});

export const imagesCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Images/ImagesCreate/ImageCreate'),
    'ImageCreate'
  ),
  getParentRoute: () => imagesRoute,
  path: 'create',
});
