import { createRoute } from '@tanstack/react-router';

import { StackScriptCreate } from 'src/features/StackScripts/StackScriptCreate/StackScriptCreate';
import { StackScriptEdit } from 'src/features/StackScripts/StackScriptEdit';
import { StackScriptDetail } from 'src/features/StackScripts/StackScriptsDetail';

import { rootRoute } from '../root';
import { StackScriptsRoute } from './StackscriptsRoute';

import type { TableSearchParams } from '../types';

interface StackScriptsSearchParams extends TableSearchParams {
  query?: string;
}

const stackScriptsRoute = createRoute({
  component: StackScriptsRoute,
  getParentRoute: () => rootRoute,
  path: 'stackscripts',
  validateSearch: (search: StackScriptsSearchParams) => search,
});

const stackScriptsLandingRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  path: '/',
}).lazy(() =>
  import('./stackscriptsLazyRoutes').then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsAccountRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  path: 'account',
}).lazy(() =>
  import('./stackscriptsLazyRoutes').then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsAccountMakePublicRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'account/$id/make-public',
}).lazy(() =>
  import('./stackscriptsLazyRoutes').then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsDeleteRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: 'account/$id/delete',
}).lazy(() =>
  import('./stackscriptsLazyRoutes').then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsCommunityRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  path: 'community',
}).lazy(() =>
  import('./stackscriptsLazyRoutes').then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsCreateRoute = createRoute({
  component: StackScriptCreate,
  getParentRoute: () => stackScriptsRoute,
  path: 'create',
});

const stackScriptsDetailRoute = createRoute({
  component: StackScriptDetail,
  getParentRoute: () => stackScriptsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id',
});

const stackScriptsEditRoute = createRoute({
  component: StackScriptEdit,
  getParentRoute: () => stackScriptsRoute,
  parseParams: (params) => ({
    id: Number(params.id),
  }),
  path: '$id/edit',
});

export const stackScriptsRouteTree = stackScriptsRoute.addChildren([
  stackScriptsLandingRoute,
  stackScriptsAccountRoute,
  stackScriptsCommunityRoute,
  stackScriptsCreateRoute,
  stackScriptsDetailRoute,
  stackScriptsEditRoute,
  stackScriptsAccountMakePublicRoute,
  stackScriptsDeleteRoute,
]);
