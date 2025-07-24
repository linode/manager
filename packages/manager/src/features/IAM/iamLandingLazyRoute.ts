import { createLazyRoute } from '@tanstack/react-router';

import { IdentityAccessLanding } from 'src/features/IAM/IAMLanding';

export const iamLandingLazyRoute = createLazyRoute('/iam')({
  component: IdentityAccessLanding,
});
