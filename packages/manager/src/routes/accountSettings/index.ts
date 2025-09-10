import { createRoute, redirect } from '@tanstack/react-router';

import { mainContentRoute } from '../mainContent';
import { AccountSettingsRoute } from './AccountSettingsRoute';

const accountSettingsRoute = createRoute({
  component: AccountSettingsRoute,
  getParentRoute: () => mainContentRoute,
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

// This supports redirecting from /settings to /account-settings(which renamed from 'settings' to 'account-settings' ).
export const settingsRouteTree = createRoute({
  getParentRoute: () => mainContentRoute,
  path: 'settings',
  beforeLoad: () => {
    throw redirect({ to: '/account-settings' });
  },
});
