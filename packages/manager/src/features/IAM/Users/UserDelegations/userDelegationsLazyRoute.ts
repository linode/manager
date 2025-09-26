import { createLazyRoute } from '@tanstack/react-router';

import { UserDelegations } from './UserDelegations';

export const userDelegationsLazyRoute = createLazyRoute(
  '/iam/users/$username/delegations'
)({
  component: UserDelegations,
});
