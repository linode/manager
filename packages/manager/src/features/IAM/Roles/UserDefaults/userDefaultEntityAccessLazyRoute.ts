import { createLazyRoute } from '@tanstack/react-router';

import { UserDefaultEntityAccess } from './UserDefaultEntityAccess';

export const userDefaultEntityAccessLazyRoute = createLazyRoute(
  '/iam/roles/default-entity-access'
)({
  component: UserDefaultEntityAccess,
});
