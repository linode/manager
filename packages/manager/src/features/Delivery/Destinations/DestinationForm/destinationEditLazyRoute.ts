import { createLazyRoute } from '@tanstack/react-router';

import { DestinationEdit } from 'src/features/Delivery/Destinations/DestinationForm/DestinationEdit';

export const destinationEditLazyRoute = createLazyRoute(
  '/logs/delivery/destinations/$destinationId/edit'
)({
  component: DestinationEdit,
});
