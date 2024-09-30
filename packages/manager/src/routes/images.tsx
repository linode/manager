import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

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
  getParentRoute: () => imagesRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Images/ImagesLanding/ImagesLanding').then(
    (m) => m.imagesLandingLazyRoute
  )
);

export const imagesCreateRoute = createRoute({
  getParentRoute: () => imagesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Images/ImagesCreate/ImageCreate').then(
    (m) => m.imageCreateLazyRoute
  )
);

export const imagesRouteTree = imagesRoute.addChildren([
  imagesIndexRoute,
  imagesCreateRoute,
]);
