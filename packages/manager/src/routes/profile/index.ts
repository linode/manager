import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { ProfileRoute } from './ProfileRoute';

interface ProfileDisplaySettingsSearchParams {
  contactDrawerOpen?: boolean;
  focusEmail?: boolean;
}

interface ProfileAuthenticationSettingsSearchParams {
  focusSecurityQuestions?: boolean;
  focusTel?: boolean;
}

interface ProfileSettingsSearchParams {
  preferenceEditor?: boolean;
}

const profileRoute = createRoute({
  component: ProfileRoute,
  getParentRoute: () => rootRoute,
  path: 'profile',
}).lazy(() =>
  import('src/features/Profile/profileLazyRoute').then(
    (m) => m.ProfileLazyRoute
  )
);

const profileDisplaySettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'display',
  validateSearch: (search: ProfileDisplaySettingsSearchParams) => search,
}).lazy(() =>
  import('src/features/Profile/DisplaySettings/displaySettingsLazyRoute').then(
    (m) => m.displaySettingsLazyRoute
  )
);

const profileAuthenticationSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'auth',
  validateSearch: (search: ProfileAuthenticationSettingsSearchParams) => search,
}).lazy(() =>
  import(
    'src/features/Profile/AuthenticationSettings/authenicationSettingsLazyRoute'
  ).then((m) => m.authenticationSettingsLazyRoute)
);

const profileSSHKeysRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'keys',
}).lazy(() =>
  import('src/features/Profile/SSHKeys/sshKeysLazyRoute').then(
    (m) => m.sshKeysLazyRoute
  )
);

const profileLishSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'lish',
}).lazy(() =>
  import('src/features/Profile/LishSettings/lishSettingsLazyRoute').then(
    (m) => m.lishSettingsLazyRoute
  )
);

const profileAPITokensRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'tokens',
}).lazy(() =>
  import('src/features/Profile/APITokens/apiTokensLazyRoute').then(
    (m) => m.apiTokensLazyRoute
  )
);

const profileOAuthClientsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'clients',
}).lazy(() =>
  import('src/features/Profile/OAuthClients/oAuthClientsLazyRoute').then(
    (m) => m.oAuthClientsLazyRoute
  )
);

const profileReferralsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'referrals',
}).lazy(() =>
  import('src/features/Profile/Referrals/referralsLazyRoute').then(
    (m) => m.referralsLazyRoute
  )
);

const profileSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'settings',
  validateSearch: (search: ProfileSettingsSearchParams) => search,
}).lazy(() =>
  import('src/features/Profile/Settings/settingsLazyRoute').then(
    (m) => m.settingsLazyRoute
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
