import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const ProfileRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Outlet />
    </React.Suspense>
  );
};

const ProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'profile',
}).lazy(() =>
  import('src/features/Profile/DisplaySettings/DisplaySettings').then(
    (m) => m.displaySettingsLazyRoute
  )
);

const ProfileDisplaySettingsRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'display',
}).lazy(() =>
  import('src/features/Profile/DisplaySettings/DisplaySettings').then(
    (m) => m.displaySettingsLazyRoute
  )
);

const ProfileAuthenticationSettingsRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'auth',
}).lazy(() =>
  import(
    'src/features/Profile/AuthenticationSettings/AuthenticationSettings'
  ).then((m) => m.authenticationSettingsLazyRoute)
);

const ProfileSSHKeysRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'keys',
}).lazy(() =>
  import('src/features/Profile/SSHKeys/SSHKeys').then((m) => m.SSHKeysLazyRoute)
);

const ProfileLishSettingsRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'lish',
}).lazy(() =>
  import('src/features/Profile/LishSettings/LishSettings').then(
    (m) => m.lishSettingsLazyRoute
  )
);

const ProfileAPITokensRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'tokens',
}).lazy(() =>
  import('src/features/Profile/APITokens/APITokens').then(
    (m) => m.APITokensLazyRoute
  )
);

const ProfileOAuthClientsRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'clients',
}).lazy(() =>
  import('src/features/Profile/OAuthClients/OAuthClients').then(
    (m) => m.OAuthClientsLazyRoute
  )
);

const ProfileReferralsRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'referrals',
}).lazy(() =>
  import('src/features/Profile/Referrals/Referrals').then(
    (m) => m.ReferralsLazyRoute
  )
);

const ProfileSettingsRoute = createRoute({
  getParentRoute: () => ProfileRoute,
  path: 'settings',
}).lazy(() =>
  import('src/features/Profile/Settings/Settings').then(
    (m) => m.SettingsLazyRoute
  )
);

export const profileRouteTree = ProfileRoute.addChildren([
  ProfileAuthenticationSettingsRoute,
  ProfileDisplaySettingsRoute,
  ProfileSSHKeysRoute,
  ProfileLishSettingsRoute,
  ProfileAPITokensRoute,
  ProfileOAuthClientsRoute,
  ProfileReferralsRoute,
  ProfileSettingsRoute,
]);
