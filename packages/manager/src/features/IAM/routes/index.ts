import { accountQueries, profileQueries } from '@linode/queries';
import { queryOptions } from '@tanstack/react-query';
import { createRoute, redirect } from '@tanstack/react-router';

/**
 * DISTRIBUTION / DECOUPLING
 *
 * These are the only imports in features/IAM that reach outside the feature. When IAM
 * ships as its own app, handle them as follows:
 *
 * 1. `rootRoute` (below)
 *    - Remove this import from the monolith's `src/routes/root`.
 *    - In the distributed app, pass that app's root route into IAM at mount time and
 *      point `iamRoute`'s `getParentRoute` at it instead of `rootRoute`.
 *    - Keep route definitions module-level in this file (export `iamRouteTree` as today).
 *      Do not move `createRoute` calls into a factory — that inflates TanStack's global
 *      `Register` type and breaks unrelated host files (Link, useTabs, etc.).
 *
 * 2. `TableSearchParams` from `src/routes/types` (type import below)
 *    - Replace with `../utilities/utilities.types` (or a shared package type). IAM should
 *      not depend on host route types; the local interface already matches pagination/order
 *      search params used by IAM tables.
 *
 * 3. Monolith router (`src/routes/index.tsx`)
 *    - Remove the `iamRouteTree` import and drop it from `routeTree.addChildren`.
 *
 * 4. Distributed app router
 *    - Mount `iamRouteTree` on the distributed root (same as other feature route trees).
 *    - Declare `Register` against the distributed `router` instance so IAM `useNavigate`,
 *      `useSearch`, and `Link` keep route inference within the distributed app.
 *
 * Reverse coupling (host importing IAM hooks/components) is a separate cleanup — not
 * covered here, but those imports must move behind a shared package or the distributed
 * boundary before IAM can fully leave the monolith repo.
 */
import { rootRoute } from '../../../routes/root';
import { IAMRoute } from './IAMRoute';

import type { TableSearchParams } from '../../../routes/types';
import type { AccessType, EntityType, User } from '@linode/api-v4';

interface IamEntitiesSearchParams extends TableSearchParams {
  entityType?: 'all' | EntityType;
  query?: string;
  selectedRole?: string;
}

interface IamUsersSearchParams extends TableSearchParams {
  action?: string;
  company?: string;
  query?: string; // to be deprecated once UIE-9292 is resolved
  username?: string;
  users?: string;
}

interface IamUserRolesSearchParams extends TableSearchParams {
  query?: string;
  roleType?: 'all' | AccessType;
}

interface IamTfaEnforcementSearchParams extends TableSearchParams {
  query?: string;
}

const iamActions = {
  'add-user': 'add-user',
  'delete-user': 'delete-user',
  'edit-user': 'edit-user',
} as const;

export type IAMAction = (typeof iamActions)[keyof typeof iamActions];

const iamRoute = createRoute({
  beforeLoad: ({ context }) => {
    if (!context.isIAMEnabled) {
      throw redirect({ to: '/users', replace: true });
    }
  },
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
}).lazy(() =>
  import('../Roles/rolesLandingLazyRoute').then((m) => m.rolesLandingLazyRoute)
);

const iamDefaultsTabsRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: 'roles/defaults',
  beforeLoad: ({ context }) => {
    const userType = context.profile?.user_type;
    const isChildOrDelegate = userType === 'child' || userType === 'delegate';

    if (!isChildOrDelegate) {
      throw redirect({ to: '/iam/roles', replace: true });
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
  beforeLoad: ({ context }) => {
    const userType = context.profile?.user_type;
    const isChildOrDelegate = userType === 'child' || userType === 'delegate';

    if (isChildOrDelegate) {
      throw redirect({ to: '/iam/users', replace: true });
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
    const { username } = params;

    if (username) {
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
}).lazy(() =>
  import('../Users/UserDetails/userProfileLazyRoute').then(
    (m) => m.userProfileLazyRoute
  )
);

const iamUserNameRolesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'roles',
  validateSearch: (search: IamUserRolesSearchParams) => search,
}).lazy(() =>
  import('../Users/UserRoles/userRolesLazyRoute').then(
    (m) => m.userRolesLazyRoute
  )
);

const iamUserNameEntitiesRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'entities',
  validateSearch: (search: IamEntitiesSearchParams) => search,
}).lazy(() =>
  import('../Users/UserEntities/userEntitiesLazyRoute').then(
    (m) => m.userEntitiesLazyRoute
  )
);

const iamUserNameDelegationsRoute = createRoute({
  getParentRoute: () => iamUserNameRoute,
  path: 'delegations',
  beforeLoad: ({ context, params }) => {
    if (context.profile?.user_type !== 'parent') {
      throw redirect({
        to: '/iam/users/$username/details',
        params: { username: params.username },
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
    const isTfaEnforcementEnabled = Boolean(context?.flags?.iamTfaEnforcement);

    if (!isFederationEnabled && !isTfaEnforcementEnabled) {
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
    if (!context.flags?.iamFederation) {
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

// ─── 2FA Enforcement sub-page ────────────────────────────────────────────────

const iamTfaEnforcementRoute = createRoute({
  getParentRoute: () => iamRoute,
  path: '/settings/tfa-enforcement',
  validateSearch: (search: IamTfaEnforcementSearchParams) => search,
  beforeLoad: ({ context }) => {
    const isTfaEnforcementEnabled = Boolean(context?.flags?.iamTfaEnforcement);

    if (!isTfaEnforcementEnabled) {
      throw redirect({ to: '/iam/users', replace: true });
    }
  },
}).lazy(() =>
  import('../LoginSettings/TFA/tfaEnforcementLandingLazyRoute').then(
    (m) => m.tfaEnforcementLandingLazyRoute
  )
);

const iamTfaEnforcementCatchAllRoute = createRoute({
  getParentRoute: () => iamTfaEnforcementRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/iam/settings/tfa-enforcement', replace: true });
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
    iamUsersRoute.addChildren([iamUsersCatchAllRoute]),
    iamDelegationsRoute,
    iamSettingsRoute.addChildren([iamSettingsCatchAllRoute]),
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
  iamTfaEnforcementRoute.addChildren([iamTfaEnforcementCatchAllRoute]),
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
