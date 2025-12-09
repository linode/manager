import { createLazyRoute } from '@tanstack/react-router';

import { EntityTransfersLanding } from './EntityTransfersLanding';

export const entityTransferLandingLazyRoute = createLazyRoute(
  '/account/service-transfers'
)({
  component: EntityTransfersLanding,
});
