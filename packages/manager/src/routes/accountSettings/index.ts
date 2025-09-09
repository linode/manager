import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { AccountSettingsRoute } from './AccountSettingsRoute';

const accountSettingsRoute = createRoute({
  component: AccountSettingsRoute,
  getParentRoute: () => rootRoute,
  path: 'account-settings',
});

// Catch all route for account-settings page
const accountSettingsCatchAllRoute = createRoute({
  getParentRoute: () => accountSettingsRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/account-settings' });
  },
});

// Index route: /account-settings (main settings content)
const accountSettingsIndexRoute = createRoute({
  getParentRoute: () => accountSettingsRoute,
  path: '/',
  beforeLoad: ({ context }) => {
    if (!context?.flags?.iamRbacPrimaryNavChanges) {
      throw redirect({
        to: `/account/settings`,
        replace: true,
      });
    }
  },
}).lazy(() =>
  import('src/features/AccountSettings/accountSettingsLandingLazyRoute').then(
    (m) => m.accountSettingsLandingLazyRoute
  )
);

export const accountSettingsRouteTree = accountSettingsRoute.addChildren([
  accountSettingsIndexRoute,
  accountSettingsCatchAllRoute,
]);

// This supports redirecting from /settings, which was initially used to redirect to /account/settings,
// and has now been changed to /account-settings.
export const settingsRouteTree = createRoute({
  getParentRoute: () => rootRoute,
  path: 'settings',
  beforeLoad: () => {
    throw redirect({ to: '/account-settings' });
  },
});
