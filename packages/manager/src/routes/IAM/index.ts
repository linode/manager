import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { IAMRoute } from './IAMRoute';

import type { TableSearchParams } from '../types';

interface IamEntitiesSearchParams {
  selectedRole?: string;
}

interface IamUsersSearchParams extends TableSearchParams {
  query?: string;
}

const iamRoute = createRoute({
  component: IAMRoute,
  getParentRoute: () => rootRoute,
  path: 'iam',
});

const iamIndexRoute = createRoute({
  beforeLoad: async () => {
    throw redirect({ to: '/iam/users' });
  },
  getParentRoute: () => iamRoute,
  path: '/',
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamRolesRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'roles',
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamUsersRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users',
  validateSearch: (search: IamUsersSearchParams) => search,
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamUserNameRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users/$username',
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
  validateSearch: (search: IamEntitiesSearchParams) => search,
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
