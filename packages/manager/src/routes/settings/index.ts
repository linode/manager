import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { SettingsRoute } from './SettingsRoute';

const settingsRoute = createRoute({
  component: SettingsRoute,
  getParentRoute: () => rootRoute,
  path: 'settings',
});

// Catch all route for settings page
const settingsCatchAllRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/$invalidPath',
  beforeLoad: () => {
    throw redirect({ to: '/settings' });
  },
});

// Index route: /settings (main settings content)
const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
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
  import('src/features/Settings/settingsLandingLazyRoute').then(
    (m) => m.settingsLandingLazyRoute
  )
);

export const settingsRouteTree = settingsRoute.addChildren([
  settingsIndexRoute,
  settingsCatchAllRoute,
]);
