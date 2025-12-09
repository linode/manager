import { createLazyRoute } from '@tanstack/react-router';

import { UsersLanding } from './Users';

export const usersLandingLazyRoute = createLazyRoute('/iam/users')({
  component: UsersLanding,
});
