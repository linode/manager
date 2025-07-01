import { createLazyRoute } from '@tanstack/react-router';

import { IdentityAccessLanding } from 'src/features/IAM/IAMLanding';
import { UserDetailsLanding } from 'src/features/IAM/Users/UserDetailsLanding';

export const iamLandingLazyRoute = createLazyRoute('/iam')({
  component: IdentityAccessLanding,
});

export const userDetailsLandingLazyRoute = createLazyRoute(
  '/iam/users/$username'
)({
  component: UserDetailsLanding,
});
