import { createRoute } from '@tanstack/react-router';

import { StackScriptCreate } from 'src/features/StackScripts/StackScriptCreate/StackScriptCreate';
import { StackScriptEdit } from 'src/features/StackScripts/StackScriptEdit';
import { StackScriptDetail } from 'src/features/StackScripts/StackScriptsDetail';

import { rootRoute } from '../root';
import { StackScriptsRoute } from './StackscriptsRoute';

const stackScriptsRoute = createRoute({
  component: StackScriptsRoute,
  getParentRoute: () => rootRoute,
  path: 'stackscripts',
});

const stackScriptsLandingRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/StackScripts/StackScriptLanding/StackScriptsLanding'
  ).then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsAccountRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  path: 'account',
}).lazy(() =>
  import(
    'src/features/StackScripts/StackScriptLanding/StackScriptsLanding'
  ).then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsCommunityRoute = createRoute({
  getParentRoute: () => stackScriptsRoute,
  path: 'community',
}).lazy(() =>
  import(
    'src/features/StackScripts/StackScriptLanding/StackScriptsLanding'
  ).then((m) => m.stackScriptsLandingLazyRoute)
);

const stackScriptsCreateRoute = createRoute({
  // TODO: TanStack Router - broken, perhaps due to being a class component.
  component: StackScriptCreate,
  getParentRoute: () => stackScriptsRoute,
  path: 'create',
});

const stackScriptsDetailRoute = createRoute({
  // TODO: TanStack Router - broken, perhaps due to being a class component.
  component: StackScriptDetail,
  getParentRoute: () => stackScriptsRoute,
  parseParams: (params) => ({
    stackScriptID: Number(params.stackScriptID),
  }),
  path: '$stackScriptID',
});

const stackScriptsEditRoute = createRoute({
  // TODO: TanStack Router - broken, perhaps due to being a class component.
  component: StackScriptEdit,
  getParentRoute: () => stackScriptsRoute,
  parseParams: (params) => ({
    stackScriptID: Number(params.stackScriptID),
  }),
  path: '$stackScriptID/edit',
});

export const stackScriptsRouteTree = stackScriptsRoute.addChildren([
  stackScriptsLandingRoute,
  stackScriptsAccountRoute,
  stackScriptsCommunityRoute,
  stackScriptsCreateRoute,
  stackScriptsDetailRoute,
  stackScriptsEditRoute,
]);
