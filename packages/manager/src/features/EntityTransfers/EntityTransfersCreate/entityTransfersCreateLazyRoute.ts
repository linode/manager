import { createLazyRoute } from '@tanstack/react-router';

import { EntityTransfersCreate } from './EntityTransfersCreate';

export const entityTransfersCreateLazyRoute = createLazyRoute(
  '/account/service-transfers/create'
)({
  component: EntityTransfersCreate,
});
