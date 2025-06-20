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
  validateSearch: (search: IamUsersSearchParams) => search,

  path: 'iam',
});

const iamCatchAllRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/users' });
  },
});

const iamIndexRoute = createRoute({
  beforeLoad: async () => {
    throw redirect({ to: '/iam/users' });
  },
  getParentRoute: () => iamRoute,
  path: '/',
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamUsersRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users',
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamUsersCatchAllRoute = createRoute({
  getParentRoute: () => iamUsersRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/users' });
  },
});

const iamRolesRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'roles',
}).lazy(() => import('./IAMLazyRoutes').then((m) => m.iamLandingLazyRoute));

const iamRolesCatchAllRoute = createRoute({
  getParentRoute: () => iamRolesRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/roles' });
  },
});

const iamUserNameRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users/$username',
}).lazy(() =>
  import('./IAMLazyRoutes').then((m) => m.userDetailsLandingLazyRoute)
);

const iamUserNameIndexRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: '/',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/iam/users/$username/details',
      params: { username: params.username },
    });
  },
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

// Catch all route for user details page
const iamUserNameCatchAllRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users/$username/$invalidPath',
  beforeLoad: ({ params }) => {
    if (!['details', 'entities', 'roles'].includes(params.invalidPath)) {
      throw redirect({
        to: '/iam/users/$username',
        params: { username: params.username },
      });
    }
  },
});

const iamUserNameDetailsCatchAllRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'details/$invalidPath',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/iam/users/$username/details',
      params: { username: params.username },
    });
  },
});

const iamUserNameRolesCatchAllRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'roles/$invalidPath',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/iam/users/$username/roles',
      params: { username: params.username },
    });
  },
});

const iamUserNameEntitiesCatchAllRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'entities/$invalidPath',
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/iam/users/$username/entities',
      params: { username: params.username },
    });
  },
});

export const iamRouteTree = iamRoute.addChildren([
  iamIndexRoute,
  iamRolesRoute,
  iamUsersRoute,
  iamCatchAllRoute,
  iamUsersCatchAllRoute,
  iamRolesCatchAllRoute,
  iamUserNameRoute.addChildren([
    iamUserNameIndexRoute,
    iamUserNameDetailsRoute,
    iamUserNameRolesRoute,
    iamUserNameEntitiesRoute,
    iamUserNameCatchAllRoute,
    iamUserNameDetailsCatchAllRoute,
    iamUserNameRolesCatchAllRoute,
    iamUserNameEntitiesCatchAllRoute,
  ]),
]);
