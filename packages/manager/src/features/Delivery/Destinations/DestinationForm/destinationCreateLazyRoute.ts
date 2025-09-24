import { createLazyRoute } from '@tanstack/react-router';

import { DestinationCreate } from 'src/features/Delivery/Destinations/DestinationForm/DestinationCreate';

export const destinationCreateLazyRoute = createLazyRoute(
  '/logs/delivery/destinations/create'
)({
  component: DestinationCreate,
});
