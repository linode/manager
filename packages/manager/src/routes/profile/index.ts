import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ProfileRoute } from './ProfileRoute';

const profileRoute = createRoute({
  component: ProfileRoute,
  getParentRoute: () => rootRoute,
  path: 'profile',
}).lazy(() =>
  import('src/features/Profile/Profile').then((m) => m.ProfileLazyRoute)
);

const profileDisplaySettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'display',
}).lazy(() =>
  import('src/features/Profile/DisplaySettings/DisplaySettings').then(
    (m) => m.displaySettingsLazyRoute
  )
);

const profileAuthenticationSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'auth',
}).lazy(() =>
  import(
    'src/features/Profile/AuthenticationSettings/AuthenticationSettings'
  ).then((m) => m.authenticationSettingsLazyRoute)
);

const profileSSHKeysRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'keys',
}).lazy(() =>
  import('src/features/Profile/SSHKeys/SSHKeys').then((m) => m.SSHKeysLazyRoute)
);

const profileLishSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'lish',
}).lazy(() =>
  import('src/features/Profile/LishSettings/LishSettings').then(
    (m) => m.lishSettingsLazyRoute
  )
);

const profileAPITokensRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'tokens',
}).lazy(() =>
  import('src/features/Profile/APITokens/APITokens').then(
    (m) => m.APITokensLazyRoute
  )
);

const profileOAuthClientsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'clients',
}).lazy(() =>
  import('src/features/Profile/OAuthClients/OAuthClients').then(
    (m) => m.OAuthClientsLazyRoute
  )
);

const profileReferralsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'referrals',
}).lazy(() =>
  import('src/features/Profile/Referrals/Referrals').then(
    (m) => m.ReferralsLazyRoute
  )
);

const profileSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'settings',
}).lazy(() =>
  import('src/features/Profile/Settings/Settings').then(
    (m) => m.SettingsLazyRoute
  )
);

export const profileRouteTree = profileRoute.addChildren([
  profileAuthenticationSettingsRoute,
  profileDisplaySettingsRoute,
  profileSSHKeysRoute,
  profileLishSettingsRoute,
  profileAPITokensRoute,
  profileOAuthClientsRoute,
  profileReferralsRoute,
  profileSettingsRoute,
]);
