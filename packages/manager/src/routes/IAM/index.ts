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
}).lazy(() =>
  import('src/features/IAM/iamLandingLazyRoute').then(
    (m) => m.iamLandingLazyRoute
  )
);

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
}).lazy(() =>
  import('src/features/IAM/iamLandingLazyRoute').then(
    (m) => m.iamLandingLazyRoute
  )
);

const iamUsersRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'users',
}).lazy(() =>
  import('src/features/IAM/Users/UsersTable/usersLandingLazyRoute').then(
    (m) => m.usersLandingLazyRoute
  )
);

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
}).lazy(() =>
  import('src/features/IAM/Roles/rolesLandingLazyRoute').then(
    (m) => m.rolesLandingLazyRoute
  )
);

const iamRolesCatchAllRoute = createRoute({
  getParentRoute: () => iamRolesRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/roles' });
  },
});

const iamUserNameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'iam/users/$username',
}).lazy(() =>
  import('src/features/IAM/Users/userDetailsLandingLazyRoute').then(
    (m) => m.userDetailsLandingLazyRoute
  )
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
  import('src/features/IAM/Users/userDetailsLandingLazyRoute').then(
    (m) => m.userDetailsLandingLazyRoute
  )
);

const iamUserNameDetailsRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'details',
}).lazy(() =>
  import('src/features/IAM/Users/UserDetails/userProfileLazyRoute').then(
    (m) => m.userProfileLazyRoute
  )
);

const iamUserNameRolesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'roles',
}).lazy(() =>
  import('src/features/IAM/Users/UserRoles/userRolesLazyRoute').then(
    (m) => m.userRolesLazyRoute
  )
);

const iamUserNameEntitiesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'entities',
  validateSearch: (search: IamEntitiesSearchParams) => search,
}).lazy(() =>
  import('src/features/IAM/Users/UserEntities/userEntitiesLazyRoute').then(
    (m) => m.userEntitiesLazyRoute
  )
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
