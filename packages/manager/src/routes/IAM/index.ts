import { createRoute, redirect } from '@tanstack/react-router';

import { checkIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

import { rootRoute } from '../root';
import { IAMRoute } from './IAMRoute';

import type { TableSearchParams } from '../types';
import { mainContentRoute } from '../mainContent';

interface IamEntitiesSearchParams {
  selectedRole?: string;
}

interface IamUsersSearchParams extends TableSearchParams {
  query?: string;
}

const iamRoute = createRoute({
  component: IAMRoute,
  getParentRoute: () => mainContentRoute,
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

const iamTabsRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: '/',
}).lazy(() =>
  import('src/features/IAM/iamLandingLazyRoute').then(
    (m) => m.iamLandingLazyRoute
  )
);

const iamUsersRoute = createRoute({
  getParentRoute: () => iamTabsRoute,
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
  getParentRoute: () => iamTabsRoute,
  path: 'roles',
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );

    if (!isIAMEnabled) {
      throw redirect({
        to: '/account/users',
      });
    }
  },
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
  getParentRoute: () => iamRoute,
  path: '/users/$username',
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
  beforeLoad: async ({ context, params }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );
    const { username } = params;
    if (!isIAMEnabled && username) {
      throw redirect({
        to: '/account/users/$username/profile',
        params: { username },
      });
    }
  },
}).lazy(() =>
  import('src/features/IAM/Users/UserDetails/userProfileLazyRoute').then(
    (m) => m.userProfileLazyRoute
  )
);

const iamUserNameRolesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'roles',
  beforeLoad: async ({ context, params }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );
    const { username } = params;

    if (!isIAMEnabled && username) {
      throw redirect({
        to: '/account/users/$username/permissions',
        params: { username },
      });
    }
  },
}).lazy(() =>
  import('src/features/IAM/Users/UserRoles/userRolesLazyRoute').then(
    (m) => m.userRolesLazyRoute
  )
);

const iamUserNameEntitiesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'entities',
  validateSearch: (search: IamEntitiesSearchParams) => search,
  beforeLoad: async ({ context, params }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );
    const { username } = params;

    if (!isIAMEnabled && username) {
      throw redirect({
        to: '/account/users/$username',
        params: { username },
      });
    }
  },
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
  iamTabsRoute.addChildren([
    iamRolesRoute,
    iamUsersRoute,
    iamUsersCatchAllRoute,
    iamRolesCatchAllRoute,
  ]),
  iamCatchAllRoute,
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
