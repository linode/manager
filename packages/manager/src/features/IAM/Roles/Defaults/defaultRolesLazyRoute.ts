import { createLazyRoute } from '@tanstack/react-router';

import { DefaultRoles } from './DefaultRoles';

export const defaultRolesLazyRoute = createLazyRoute(
  '/iam/roles/defaults/roles'
)({
  component: DefaultRoles,
});
