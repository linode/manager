import { createLazyRoute } from '@tanstack/react-router';

import { StreamCreate } from 'src/features/Delivery/Streams/StreamForm/StreamCreate';

export const streamCreateLazyRoute = createLazyRoute(
  '/logs/delivery/streams/create'
)({
  component: StreamCreate,
});
