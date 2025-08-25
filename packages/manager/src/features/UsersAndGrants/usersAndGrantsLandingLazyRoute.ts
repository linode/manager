import { createLazyRoute } from '@tanstack/react-router';

import { UsersAndGrants } from './UsersAndGrants';

export const usersAndGrantsLandingLazyRoute = createLazyRoute('/users')({
  component: UsersAndGrants,
});
