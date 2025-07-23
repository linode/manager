import { createLazyRoute } from '@tanstack/react-router';

import { RolesLanding } from './Roles';

export const rolesLandingLazyRoute = createLazyRoute('/iam/roles')({
  component: RolesLanding,
});
