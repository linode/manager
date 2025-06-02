import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { IAMRoute } from './IAMRoute';

const iamRoute = createRoute({
  component: IAMRoute,
  getParentRoute: () => rootRoute,
  path: 'iam',
});

const iamIndexRoute = createRoute({
  component: IAMRoute,
  getParentRoute: () => iamRoute,
  path: '/',
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'roles',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

const iamUsersRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

const iamUserNameRoute = createRoute({
  getParentRoute: () => iamUsersRoute,
  path: '$username',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

const iamUserNameDetailsRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'details',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

const iamUserNameRolesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'roles',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

const iamUserNameEntitiesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'entities',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

export const iamRouteTree = iamRoute.addChildren([
  iamIndexRoute,
  iamRolesRoute,
  iamUsersRoute,
  iamUserNameRoute.addChildren([
    iamUserNameDetailsRoute,
    iamUserNameRolesRoute,
    iamUserNameEntitiesRoute,
  ]),
]);
