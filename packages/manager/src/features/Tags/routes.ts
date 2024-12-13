import { createRoute } from '@tanstack/react-router';

import { rootRoute } from 'src/routes/root';

const tagsRoute = createRoute({
  path: 'tags',
  getParentRoute: () => rootRoute,
});

export const tagsLandingRoute = createRoute({
  getParentRoute: () => tagsRoute,
  path: '/',
}).lazy(() => import('./Tags').then((r) => r.tagsLandingLazyRoute));

export const tagDetailsRoute = createRoute({
  getParentRoute: () => tagsRoute,
  path: '$tag',
}).lazy(() => import('./Tag').then((r) => r.tagDetailsLazyRoute));

export const tagsRoutes = tagsRoute.addChildren([
  tagsLandingRoute,
  tagDetailsRoute,
]);
