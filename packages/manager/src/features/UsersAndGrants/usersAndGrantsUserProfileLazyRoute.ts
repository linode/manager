import { createLazyRoute } from '@tanstack/react-router';

import { UserDetail } from '../Users/UserDetail';

export const usersAndGrantsUserProfileLazyRoute = createLazyRoute(
  '/users/$username'
)({
  component: UserDetail,
});
