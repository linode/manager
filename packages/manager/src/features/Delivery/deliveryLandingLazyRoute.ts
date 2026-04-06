import { createLazyRoute } from '@tanstack/react-router';

import { DeliveryLanding } from 'src/features/Delivery/DeliveryLanding';

export const deliveryLandingLazyRoute = createLazyRoute('/logs/delivery')({
  component: DeliveryLanding,
});
