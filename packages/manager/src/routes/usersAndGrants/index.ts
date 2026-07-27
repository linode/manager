import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { UsersAndGrantsRoute } from './UsersAndGrantsRoute';

const usersAndGrantsRoute = createRoute({
  beforeLoad: ({ context, location }) => {
    if (!context.isIAMEnabled) {
      return;
    }

    const { pathname } = location;

    if (pathname === '/users' || pathname === '/users/') {
      throw redirect({ to: '/iam/users', replace: true });
    }

    const match = pathname.match(/^\/users\/([^/]+)/);

    if (match) {
      throw redirect({
        to: pathname.endsWith('/permissions')
          ? '/iam/users/$username/roles'
          : '/iam/users/$username/details',
        params: { username: match[1] },
        replace: true,
      });
    }
  },
  component: UsersAndGrantsRoute,
  getParentRoute: () => rootRoute,
  path: 'users',
});

const usersAndGrantsIndexRoute = createRoute({
  getParentRoute: () => usersAndGrantsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/UsersAndGrants/usersAndGrantsLandingLazyRoute').then(
    (m) => m.usersAndGrantsLandingLazyRoute
  )
);

const usersAndGrantsUsernameRoute = createRoute({
  getParentRoute: () => usersAndGrantsRoute,
  path: '$username',
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
