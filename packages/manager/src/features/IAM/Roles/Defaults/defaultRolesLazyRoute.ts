import { createLazyRoute } from '@tanstack/react-router';

import { UserDefaultRoles } from './DefaultRoles';

export const userDefaultRolesLazyRoute = createLazyRoute(
  '/iam/roles/defaults/roles'
)({
  component: UserDefaultRoles,
});
