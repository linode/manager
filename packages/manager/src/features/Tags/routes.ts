import { createRoute } from '@tanstack/react-router';

import { rootRoute } from 'src/routes/root';

import type { TableSearchParams } from 'src/routes/types';

export interface TagsSearchParams extends TableSearchParams {
  query?: string;
}

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'tags',
});

export const tagsLandingRoute = createRoute({
  getParentRoute: () => tagsRoute,
  path: '/',
}).lazy(() => import('./Tags').then((r) => r.tagsLandingLazyRoute));

export const tagsV2LandingRoute = createRoute({
  getParentRoute: () => tagsRoute,
  path: '/groups',
  validateSearch: (search: TagsSearchParams) => search,
}).lazy(() => import('./TagsV2').then((r) => r.tagsV2LandingLazyRoute));

export const tagDetailsRoute = createRoute({
  getParentRoute: () => tagsRoute,
  path: '$tag',
}).lazy(() => import('./Tag').then((r) => r.tagDetailsLazyRoute));

export const tagsRoutes = tagsRoute.addChildren([
  tagsLandingRoute,
  tagDetailsRoute,
  tagsV2LandingRoute,
]);
