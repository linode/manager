import { createLazyRoute } from '@tanstack/react-router';

import { UserDetailsLanding } from './UserDetailsLanding';

export const userDetailsLandingLazyRoute = createLazyRoute(
  '/iam/users/$username'
)({
  component: UserDetailsLanding,
});
