import { accountQueries, profileQueries } from '@linode/queries';
import { queryOptions } from '@tanstack/react-query';
import { createRoute, redirect } from '@tanstack/react-router';

import { checkIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

import { rootRoute } from '../root';
import { IAMRoute } from './IAMRoute';

import type { TableSearchParams } from '../types';
import type { User } from '@linode/api-v4';

interface IamEntitiesSearchParams {
  selectedRole?: string;
}

interface IamUsersSearchParams extends TableSearchParams {
  query?: string;
  users?: string;
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
    throw redirect({ to: '/iam/users', replace: true });
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
    throw redirect({ to: '/iam/users', replace: true });
  },
});

const iamRolesRoute = createRoute({
  getParentRoute: () => iamTabsRoute,
  path: 'roles',
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags,
      context.profile
    );

    if (!isIAMEnabled) {
      throw redirect({
        to: '/account/users',
        replace: true,
      });
    }
  },
});

const iamRolesIndexRoute = createRoute({
  getParentRoute: () => iamRolesRoute,
  path: '/',
}).lazy(() =>
  import('src/features/IAM/Roles/rolesLandingLazyRoute').then(
    (m) => m.rolesLandingLazyRoute
  )
);

const iamDefaultsTabsRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'roles/defaults',
  beforeLoad: async ({ context }) => {
    const isDelegationEnabled = context?.flags?.iamDelegation?.enabled;
    const profile = context?.profile;
    const userType = profile?.user_type;

    if (userType !== 'child' || !isDelegationEnabled) {
      throw redirect({
        to: '/iam/roles',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/IAM/Roles/Defaults/defaultsLandingLazyRoute').then(
    (m) => m.defaultsLandingLazyRoute
  )
);

const iamDefaultRolesRoute = createRoute({
  getParentRoute: () => iamDefaultsTabsRoute,
  path: 'roles',
}).lazy(() =>
  import('src/features/IAM/Roles/Defaults/defaultRolesLazyRoute').then(
    (m) => m.defaultRolesLazyRoute
  )
);

const iamDefaultEntityAccessRoute = createRoute({
  getParentRoute: () => iamDefaultsTabsRoute,
  path: 'entity-access',
}).lazy(() =>
  import('src/features/IAM/Roles/Defaults/defaultEntityAccessLazyRoute').then(
    (m) => m.defaultEntityAccessLazyRoute
  )
);

const iamRolesCatchAllRoute = createRoute({
  getParentRoute: () => iamRolesRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/roles', replace: true });
  },
});

const iamDelegationsRoute = createRoute({
  getParentRoute: () => iamTabsRoute,
  path: 'delegations',
  beforeLoad: async ({ context }) => {
    const isDelegationEnabled = context?.flags?.iamDelegation?.enabled;
    const profile = context?.profile;

    const isChildAccount = profile?.user_type === 'child';
    if (!isDelegationEnabled || isChildAccount) {
      throw redirect({
        to: '/iam/users',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/IAM/Delegations/delegationsLandingLazyRoute').then(
    (m) => m.delegationsLandingLazyRoute
  )
);

const iamDelegationsCatchAllRoute = createRoute({
  getParentRoute: () => iamDelegationsRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/delegations', replace: true });
  },
});

const iamUserNameRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: '/users/$username',
  loader: async ({ context, params, location }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags,
      context.profile
    );
    const { username } = params;
    const isIAMDelegationEnabled = context.flags?.iamDelegation?.enabled;

    if (isIAMEnabled && username && isIAMDelegationEnabled) {
      const profile = await context.queryClient.ensureQueryData(
        queryOptions(profileQueries.profile())
      );

      const isChildAccount = profile?.user_type === 'child';

      if (!profile.restricted && isChildAccount) {
        let user: undefined | User;
        try {
          user = await context.queryClient.ensureQueryData(
            queryOptions(accountQueries.users._ctx.user(username))
          );
        } catch (error) {
          return error[0].reason;
        }

        const isChildAccount = profile?.user_type === 'child';
        const isDelegateUser = user.user_type === 'delegate';

        // Determine if the current account is a child account with isIAMDelegationEnabled enabled
        // If so, we need to hide 'View User Details' and 'Account Delegations' tabs for delegate users
        const isDelegateUserForChildAccount = isChildAccount && isDelegateUser;

        // There is no detail view for delegate users in a child account
        if (
          isDelegateUserForChildAccount &&
          location.pathname.endsWith('/details')
        ) {
          throw redirect({
            to: '/iam/users/$username/roles',
            params: { username },
            replace: true,
          });
        }

        // We may not need to return all this data tho I can't think of a reason why we wouldn't,
        // considering several views served by this route rely on it.
        return {
          user,
          profile,
          isIAMDelegationEnabled,
          isDelegateUserForChildAccount,
        };
      }
    }

    return {
      isIAMEnabled,
      username,
    };
  },
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
      replace: true,
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
      context.flags,
      context.profile
    );
    const { username } = params;
    if (!isIAMEnabled && username) {
      throw redirect({
        to: '/account/users/$username/profile',
        params: { username },
        replace: true,
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
      context.flags,
      context.profile
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
      context.flags,
      context.profile
    );
    const { username } = params;

    if (!isIAMEnabled && username) {
      throw redirect({
        to: '/account/users/$username',
        params: { username },
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/IAM/Users/UserEntities/userEntitiesLazyRoute').then(
    (m) => m.userEntitiesLazyRoute
  )
);

const iamUserNameDelegationsRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'delegations',
  beforeLoad: async ({ context, params }) => {
    const isDelegationEnabled = context?.flags?.iamDelegation?.enabled;
    const profile = context?.profile;
    const userType = profile?.user_type;
    const { username } = params;

    if (userType !== 'parent' || !isDelegationEnabled) {
      throw redirect({
        to: '/iam/users/$username/details',
        params: { username },
        replace: true,
      });
    }
  },
}).lazy(() =>
  import(
    'src/features/IAM/Users/UserDelegations/userDelegationsLazyRoute'
  ).then((m) => m.userDelegationsLazyRoute)
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
        replace: true,
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
      replace: true,
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
      replace: true,
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
      replace: true,
    });
  },
});

export const iamRouteTree = iamRoute.addChildren([
  iamTabsRoute.addChildren([
    iamRolesRoute.addChildren([
      iamRolesIndexRoute,
      iamDefaultsTabsRoute.addChildren([
        iamDefaultRolesRoute,
        iamDefaultEntityAccessRoute,
      ]),
    ]),
    iamUsersRoute,
    iamDelegationsRoute,
    iamUsersCatchAllRoute,
    iamRolesCatchAllRoute,
    iamDelegationsCatchAllRoute,
  ]),
  iamCatchAllRoute,
  iamUserNameRoute.addChildren([
    iamUserNameIndexRoute,
    iamUserNameDetailsRoute,
    iamUserNameRolesRoute,
    iamUserNameEntitiesRoute,
    iamUserNameDelegationsRoute,
    iamUserNameCatchAllRoute,
    iamUserNameDetailsCatchAllRoute,
    iamUserNameRolesCatchAllRoute,
    iamUserNameEntitiesCatchAllRoute,
  ]),
]);
