import { createLazyRoute } from '@tanstack/react-router';

import { DataStreamLanding } from 'src/features/DataStream/DataStreamLanding';
import { StreamCreate } from 'src/features/DataStream/Streams/StreamCreate/StreamCreate';

export const dataStreamLandingLazyRoute = createLazyRoute('/datastream')({
  component: DataStreamLanding,
});

export const streamCreateLazyRoute = createLazyRoute(
  '/datastream/streams/create'
)({
  component: StreamCreate,
});
