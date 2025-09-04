import { createLazyRoute } from '@tanstack/react-router';

import { AccountSettingsLanding } from './AccountSettingsLanding';

export const accountSettingsLandingLazyRoute = createLazyRoute(
  '/account-settings'
)({
  component: AccountSettingsLanding,
});
