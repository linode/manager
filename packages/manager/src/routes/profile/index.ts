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
}).lazy(() => import('./profileLazyRoutes').then((m) => m.ProfileLazyRoute));

const profileDisplaySettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'display',
  validateSearch: (search: ProfileDisplaySettingsSearchParams) => search,
});

const profileAuthenticationSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'auth',
  validateSearch: (search: ProfileAuthenticationSettingsSearchParams) => search,
});

const profileSSHKeysRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'keys',
});

const profileLishSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'lish',
});

const profileAPITokensRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'tokens',
});

const profileOAuthClientsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'clients',
});

const profileReferralsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'referrals',
});

const profileSettingsRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: 'settings',
  validateSearch: (search: ProfileSettingsSearchParams) => search,
});

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
