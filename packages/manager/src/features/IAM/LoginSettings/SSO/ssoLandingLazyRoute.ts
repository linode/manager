import { createLazyRoute } from '@tanstack/react-router';

import { SSOLanding } from './SSOLanding';

export const ssoLandingLazyRoute = createLazyRoute('/iam/login-settings/sso')({
  component: SSOLanding,
});
