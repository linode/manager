import { createLazyRoute } from '@tanstack/react-router';

import { IdentityAccessLanding } from './IAMLanding';

export const iamLandingLazyRoute = createLazyRoute('/iam')({
  component: IdentityAccessLanding,
});
