import { accountQueries, profileQueries } from '@linode/queries';
import { queryOptions } from '@tanstack/react-query';
import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../../../routes/root';
import { checkIAMEnabled } from '../hooks/useIsIAMEnabled';
import { IAMRoute } from './IAMRoute';

import type { TableSearchParams } from '../../../routes/types';
import type { AccessType, EntityType, User } from '@linode/api-v4';

interface IamEntitiesSearchParams extends TableSearchParams {
  entityType?: 'all' | EntityType;
  query?: string;
  selectedRole?: string;
}

interface IamUsersSearchParams extends TableSearchParams {
  company?: string;
  query?: string; // to be deprecated once UIE-9292 is resolved
  users?: string;
}

interface IamUserRolesSearchParams extends TableSearchParams {
  query?: string;
  roleType?: 'all' | AccessType;
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
  import('../iamLandingLazyRoute').then((m) => m.iamLandingLazyRoute)
);

const iamUsersRoute = createRoute({
  getParentRoute: () => iamTabsRoute,
  path: 'users',
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags,
      context.profile
    );

    if (!isIAMEnabled) {
      throw redirect({
        to: '/users',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('../Users/UsersTable/usersLandingLazyRoute').then(
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
  validateSearch: (search: IamUserRolesSearchParams) => search,
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags,
      context.profile
    );

    if (!isIAMEnabled) {
      throw redirect({
        to: '/users',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('../Roles/rolesLandingLazyRoute').then((m) => m.rolesLandingLazyRoute)
);

const iamDefaultsTabsRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'roles/defaults',
  beforeLoad: async ({ context }) => {
    const profile = context?.profile;
    const userType = profile?.user_type;

    const isChildOrDelegate = userType === 'child' || userType === 'delegate';

    if (!isChildOrDelegate) {
      throw redirect({
        to: '/iam/roles',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('../Roles/Defaults/defaultsLandingLazyRoute').then(
    (m) => m.defaultsLandingLazyRoute
  )
);

const iamDefaultRolesRoute = createRoute({
  getParentRoute: () => iamDefaultsTabsRoute,
  path: 'roles',
  validateSearch: (search: IamUserRolesSearchParams) => search,
}).lazy(() =>
  import('../Roles/Defaults/defaultRolesLazyRoute').then(
    (m) => m.defaultRolesLazyRoute
  )
);

const iamDefaultEntityAccessRoute = createRoute({
  getParentRoute: () => iamDefaultsTabsRoute,
  path: 'entity-access',
  validateSearch: (search: IamEntitiesSearchParams) => search,
}).lazy(() =>
  import('../Roles/Defaults/defaultEntityAccessLazyRoute').then(
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
    const profile = context?.profile;

    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags,
      context.profile
    );

    if (!isIAMEnabled) {
      throw redirect({
        to: '/users',
        replace: true,
      });
    }

    const isChildAccount = profile?.user_type === 'child';
    const isDelegateAccount = profile?.user_type === 'delegate';
    const isChildOrDelegate = isChildAccount || isDelegateAccount;
    if (isChildOrDelegate) {
      throw redirect({
        to: '/iam/users',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('../Delegations/delegationsLandingLazyRoute').then(
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

    if (isIAMEnabled && username) {
      const profile = await context.queryClient.ensureQueryData(
        queryOptions(profileQueries.profile())
      );

      const isChildAccount = profile?.user_type === 'child';
      const isDelegateAccount = profile?.user_type === 'delegate';

      if (isChildAccount || isDelegateAccount) {
        let user: undefined | User;
        try {
          user = await context.queryClient.ensureQueryData(
            queryOptions(accountQueries.users._ctx.user(username))
          );
        } catch (error) {
          return error[0].reason;
        }

        const isChildAccount = profile?.user_type === 'child';
        const isDelegateAccount = profile?.user_type === 'delegate';
        const isDelegateUser = user.user_type === 'delegate';

        // For child/delegate profiles viewing a delegate user, hide details-oriented tabs
        const isDelegateUserForChildAccount =
          (isChildAccount || isDelegateAccount) && isDelegateUser;

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
  import('../Users/userDetailsLandingLazyRoute').then(
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
  import('../Users/userDetailsLandingLazyRoute').then(
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
  import('../Users/UserDetails/userProfileLazyRoute').then(
    (m) => m.userProfileLazyRoute
  )
);

const iamUserNameRolesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'roles',
  validateSearch: (search: IamUserRolesSearchParams) => search,
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
  import('../Users/UserRoles/userRolesLazyRoute').then(
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
  import('../Users/UserEntities/userEntitiesLazyRoute').then(
    (m) => m.userEntitiesLazyRoute
  )
);

const iamUserNameDelegationsRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'delegations',
  beforeLoad: async ({ context, params }) => {
    const profile = context?.profile;
    const userType = profile?.user_type;
    const { username } = params;

    if (userType !== 'parent') {
      throw redirect({
        to: '/iam/users/$username/details',
        params: { username },
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('../Users/UserDelegations/userDelegationsLazyRoute').then(
    (m) => m.userDelegationsLazyRoute
  )
);

// ─── Settings ───────────────────────────────────────────────────────────

const iamSettingsRoute = createRoute({
  getParentRoute: () => iamTabsRoute,
  path: 'settings',
  beforeLoad: ({ context }) => {
    const isFederationEnabled = Boolean(context?.flags?.iamFederation);

    if (!isFederationEnabled) {
      throw redirect({ to: '/iam/users', replace: true });
    }
  },
}).lazy(() =>
  import('../LoginSettings/loginSettingsLandingLazyRoute').then(
    (m) => m.loginSettingsLandingLazyRoute
  )
);

const iamSettingsCatchAllRoute = createRoute({
  getParentRoute: () => iamSettingsRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/settings', replace: true });
  },
});

// ─── SSO sub-page (shell with 3 tabs) ─────────────────────────────────────────

const iamSsoRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: '/settings/sso',
  beforeLoad: ({ context }) => {
    const isFederationEnabled = Boolean(context?.flags?.iamFederation);

    if (!isFederationEnabled) {
      throw redirect({ to: '/iam/users', replace: true });
    }
  },
}).lazy(() =>
  import('../LoginSettings/SSO/ssoLandingLazyRoute').then(
    (m) => m.ssoLandingLazyRoute
  )
);

const iamSsoIndexRoute = createRoute({
  getParentRoute: () => iamSsoRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/iam/settings/sso/idp-configurations',
      replace: true,
    });
  },
});

const iamSsoIdpConfigurationsRoute = createRoute({
  getParentRoute: () => iamSsoRoute,
  path: 'idp-configurations',
}).lazy(() =>
  import(
    '../LoginSettings/SSO/IdpConfigurations/idpConfigurationsLazyRoute'
  ).then((m) => m.idpConfigurationsLazyRoute)
);

const iamSsoEnforcementSettingsRoute = createRoute({
  getParentRoute: () => iamSsoRoute,
  path: 'enforcement-settings',
}).lazy(() =>
  import(
    '../LoginSettings/SSO/EnforcementSettings/enforcementSettingsLazyRoute'
  ).then((m) => m.enforcementSettingsLazyRoute)
);

const iamSsoCatchAllRoute = createRoute({
  getParentRoute: () => iamSsoRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({
      to: '/iam/settings/sso/idp-configurations',
      replace: true,
    });
  },
});

// ─── Catch all route for user details page ───────────────────────────────────

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
      iamDefaultsTabsRoute.addChildren([
        iamDefaultRolesRoute,
        iamDefaultEntityAccessRoute,
      ]),
    ]),
    iamUsersRoute,
    iamDelegationsRoute,
    iamSettingsRoute.addChildren([iamSettingsCatchAllRoute]),
    iamUsersCatchAllRoute,
    iamRolesCatchAllRoute,
    iamDelegationsCatchAllRoute,
  ]),
  iamCatchAllRoute,
  iamSsoRoute.addChildren([
    iamSsoIndexRoute,
    iamSsoIdpConfigurationsRoute,
    iamSsoEnforcementSettingsRoute,
    iamSsoCatchAllRoute,
  ]),
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
