import { createLazyRoute } from '@tanstack/react-router';

import { StreamEdit } from 'src/features/Delivery/Streams/StreamForm/StreamEdit';

export const streamEditLazyRoute = createLazyRoute(
  '/logs/delivery/streams/$streamId/edit'
)({
  component: StreamEdit,
});
