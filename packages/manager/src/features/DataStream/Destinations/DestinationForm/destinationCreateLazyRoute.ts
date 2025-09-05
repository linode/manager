import { createLazyRoute } from '@tanstack/react-router';

import { DestinationCreate } from 'src/features/DataStream/Destinations/DestinationForm/DestinationCreate';

export const destinationCreateLazyRoute = createLazyRoute(
  '/datastream/destinations/create'
)({
  component: DestinationCreate,
});
