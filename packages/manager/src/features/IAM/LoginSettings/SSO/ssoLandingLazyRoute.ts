import { createLazyRoute } from '@tanstack/react-router';

import { SSOLanding } from './SSOLanding';

export const ssoLandingLazyRoute = createLazyRoute('/iam/settings/sso')({
  component: SSOLanding,
});
