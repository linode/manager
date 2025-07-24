import { createLazyRoute } from '@tanstack/react-router';

import { UserDetailsLanding } from 'src/features/IAM/Users/UserDetailsLanding';

export const userDetailsLandingLazyRoute = createLazyRoute(
  '/iam/users/$username'
)({
  component: UserDetailsLanding,
});
