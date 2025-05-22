import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { SearchRoute } from './SearchRoute';

type SearchSearchParams = {
  query: string;
};

const searchRoute = createRoute({
  component: SearchRoute,
  getParentRoute: () => rootRoute,
  path: 'search',
  validateSearch: (search: SearchSearchParams) => search,
});

const searchLandingRoute = createRoute({
  getParentRoute: () => searchRoute,
  path: '/',
}).lazy(() =>
  import('./searchLazyRoutes').then((m) => m.searchLandingLazyRoute)
);

export const searchRouteTree = searchRoute.addChildren([searchLandingRoute]);
