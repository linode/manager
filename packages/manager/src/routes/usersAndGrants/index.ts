import { createRoute, redirect } from '@tanstack/react-router';

import { checkIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

import { rootRoute } from '../root';
import { UsersAndGrantsRoute } from './UsersAndGrantsRoute';

const usersAndGrantsRoute = createRoute({
  component: UsersAndGrantsRoute,
  getParentRoute: () => rootRoute,
  path: 'users',
});

const usersAndGrantsIndexRoute = createRoute({
  getParentRoute: () => usersAndGrantsRoute,
  path: '/',
  beforeLoad: async ({ context }) => {
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );

    if (isIAMEnabled) {
      throw redirect({
        to: '/iam/users',
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/UsersAndGrants/usersAndGrantsLandingLazyRoute').then(
    (m) => m.usersAndGrantsLandingLazyRoute
  )
);

const usersAndGrantsUsernameRoute = createRoute({
  getParentRoute: () => usersAndGrantsRoute,
  path: '$username',
  beforeLoad: async ({ context, params, location }) => {
    const { username } = params;
    const isIAMEnabled = await checkIAMEnabled(
      context.queryClient,
      context.flags
    );

    if (isIAMEnabled) {
      const url = location.pathname.endsWith('/permissions')
        ? '/iam/users/$username/roles'
        : '/iam/users/$username/details';
      throw redirect({
        to: url,
        params: { username },
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/UsersAndGrants/usersAndGrantsUserProfileLazyRoute').then(
    (m) => m.usersAndGrantsUserProfileLazyRoute
  )
);

const usersAndGrantsUsernameProfileRoute = createRoute({
  getParentRoute: () => usersAndGrantsUsernameRoute,
  path: 'profile',
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

const usersAndGrantsUsernamePermissionsRoute = createRoute({
  getParentRoute: () => usersAndGrantsUsernameRoute,
  path: 'permissions',
}).lazy(() =>
  import('src/features/Users/userDetailLazyRoute').then(
    (m) => m.userDetailLazyRoute
  )
);

export const usersAndGrantsRouteTree = usersAndGrantsRoute.addChildren([
  usersAndGrantsIndexRoute,
  usersAndGrantsUsernameRoute.addChildren([
    usersAndGrantsUsernameProfileRoute,
    usersAndGrantsUsernamePermissionsRoute,
  ]),
]);
