import { createLazyRoute } from '@tanstack/react-router';

import { UserRoles } from './UserRoles';

export const userRolesLazyRoute = createLazyRoute('/iam/users/$username/roles')(
  {
    component: UserRoles,
  }
);
