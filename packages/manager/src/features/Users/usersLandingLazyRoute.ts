import { createLazyRoute } from '@tanstack/react-router';

import { UsersLanding } from './UsersLanding';

export const usersLandingLazyRoute = createLazyRoute('/account/users')({
  component: UsersLanding,
});
