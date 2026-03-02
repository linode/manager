import { createLazyRoute } from '@tanstack/react-router';

import { DefaultEntityAccess } from './DefaultEntityAccess';

export const defaultEntityAccessLazyRoute = createLazyRoute(
  '/iam/roles/defaults/entity-access'
)({
  component: DefaultEntityAccess,
});
