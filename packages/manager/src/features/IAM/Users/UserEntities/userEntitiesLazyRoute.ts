import { createLazyRoute } from '@tanstack/react-router';

import { UserEntities } from './UserEntities';

export const userEntitiesLazyRoute = createLazyRoute(
  '/iam/users/$username/entities'
)({
  component: UserEntities,
});
