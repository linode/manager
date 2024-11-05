import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { SearchRoute } from './SearchRoute';

const searchRoute = createRoute({
  component: SearchRoute,
  getParentRoute: () => rootRoute,
  path: 'search',
});

const searchLandingRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Search/SearchLanding').then(
    (m) => m.searchLandingLazyRoute
  )
);

export const searchRouteTree = searchRoute.addChildren([searchLandingRoute]);
