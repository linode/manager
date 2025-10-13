import { createLazyRoute } from '@tanstack/react-router';

import { UserDefaultEntityAccess } from './DefaultEntityAccess';

export const userDefaultEntityAccessLazyRoute = createLazyRoute(
  '/iam/roles/defaults/entity-access'
)({
  component: UserDefaultEntityAccess,
});
