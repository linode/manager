import { createLazyRoute } from '@tanstack/react-router';

import { UserDefaultRoles } from './UserDefaultRoles';

export const userDefaultRolesLazyRoute = createLazyRoute(
  '/iam/roles/default-roles'
)({
  component: UserDefaultRoles,
});
