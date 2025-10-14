import { createLazyRoute } from '@tanstack/react-router';

import { ServiceTransfersLanding } from './ServiceTransfersLanding';

export const serviceTransfersLandingLazyRoute = createLazyRoute(
  '/service-transfers'
)({
  component: ServiceTransfersLanding,
});
