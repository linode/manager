import { createLazyRoute } from '@tanstack/react-router';

import { StreamLanding } from 'src/features/Delivery/Streams/Stream/StreamLanding';

export const streamLandingLazyRoute = createLazyRoute(
  '/logs/delivery/streams/$streamId'
)({
  component: StreamLanding,
});
