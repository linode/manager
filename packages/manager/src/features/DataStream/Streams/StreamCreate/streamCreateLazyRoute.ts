import { createLazyRoute } from '@tanstack/react-router';

import { StreamCreate } from 'src/features/DataStream/Streams/StreamCreate/StreamCreate';

export const streamCreateLazyRoute = createLazyRoute(
  '/datastream/streams/create'
)({
  component: StreamCreate,
});
