import { createLazyRoute } from '@tanstack/react-router';

import { DataStreamLanding } from 'src/features/DataStream/DataStreamLanding';

export const dataStreamLandingLazyRoute = createLazyRoute('/datastream')({
  component: DataStreamLanding,
});
