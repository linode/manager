import { createLazyRoute } from '@tanstack/react-router';

import { EntityTransfersCreate } from '../EntityTransfers/EntityTransfersCreate/EntityTransfersCreate';

export const serviceTransfersCreateLazyRoute = createLazyRoute(
  '/service-transfers/create'
)({
  component: EntityTransfersCreate,
});
