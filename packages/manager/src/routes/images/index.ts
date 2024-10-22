import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ImagesRoutes } from './ImagesRoute';

const imagesRoute = createRoute({
  component: ImagesRoutes,
  getParentRoute: () => rootRoute,
  path: 'images',
});

const imagesIndexRoute = createRoute({
  getParentRoute: () => imagesRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Images/ImagesLanding/ImagesLanding').then(
    (m) => m.imagesLandingLazyRoute
  )
);

const imagesCreateRoute = createRoute({
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
