import { createLazyRoute } from '@tanstack/react-router';

import { LoginSettingsLanding } from './LoginSettingsLanding';

export const loginSettingsLandingLazyRoute = createLazyRoute('/iam/settings')({
  component: LoginSettingsLanding,
});
