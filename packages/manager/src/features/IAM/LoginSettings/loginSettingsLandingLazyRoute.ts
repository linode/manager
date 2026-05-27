import { createLazyRoute } from '@tanstack/react-router';

import { LoginSettingsLanding } from './LoginSettingsLanding';

export const loginSettingsLandingLazyRoute = createLazyRoute(
  '/iam/login-settings'
)({
  component: LoginSettingsLanding,
});
