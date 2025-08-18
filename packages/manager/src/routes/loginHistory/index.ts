import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { LoginHistoryRoute } from './LoginHistoryRoute';

const loginHistoryRoute = createRoute({
  component: LoginHistoryRoute,
  getParentRoute: () => rootRoute,
  path: 'login-history',
});

// Catch all route for login historyRoute page
const loginHistoryCatchAllRoute = createRoute({
  getParentRoute: () => loginHistoryRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/login-history' });
  },
});

// Index route: /login-history (main login-history content)
const loginHistoryIndexRoute = createRoute({
  getParentRoute: () => loginHistoryRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/account/login-history`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/LoginHistory/loginHistoryLandingLazyRoute').then(
    (m) => m.loginHistoryLandingLazyRoute
  )
);

export const loginHistoryRouteTree = loginHistoryRoute.addChildren([
  loginHistoryIndexRoute,
  loginHistoryCatchAllRoute,
]);
