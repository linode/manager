import { createLazyRoute } from '@tanstack/react-router';

import { DestinationEdit } from 'src/features/DataStream/Destinations/DestinationForm/DestinationEdit';

export const destinationEditLazyRoute = createLazyRoute(
  '/datastream/destinations/$destinationId/edit'
)({
  component: DestinationEdit,
});
