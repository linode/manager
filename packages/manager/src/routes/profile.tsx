import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const ProfileRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Outlet />
    </React.Suspense>
  );
};

const ProfileRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/DisplaySettings/DisplaySettings'),
    'DisplaySettings'
  ),
  getParentRoute: () => rootRoute,
  path: 'profile',
});

const ProfileDisplaySettingsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/DisplaySettings/DisplaySettings'),
    'DisplaySettings'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'display',
});

const ProfileAuthenticationSettingsRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import(
        'src/features/Profile/AuthenticationSettings/AuthenticationSettings'
      ),
    'AuthenticationSettings'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'auth',
});

const ProfileSSHKeysRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/SSHKeys/SSHKeys'),
    'SSHKeys'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'keys',
});

const ProfileLishSettingsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/LishSettings/LishSettings'),
    'LishSettings'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'lish',
});

const ProfileAPITokensRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/APITokens/APITokens'),
    'APITokens'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'tokens',
});

const ProfileOAuthClientsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/OAuthClients/OAuthClients')
  ),
  getParentRoute: () => ProfileRoute,
  path: 'clients',
});

const ProfileReferralsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/Referrals/Referrals'),
    'Referrals'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'referrals',
});

const ProfileSettingsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Profile/Settings/Settings'),
    'ProfileSettings'
  ),
  getParentRoute: () => ProfileRoute,
  path: 'settings',
});

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
