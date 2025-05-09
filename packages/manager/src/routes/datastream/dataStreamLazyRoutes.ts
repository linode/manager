import { createLazyRoute } from '@tanstack/react-router';

import DataStreamLanding from '../../features/DataStream/DataStreamLanding';

export const dataStreamLandingLazyRoute = createLazyRoute('/datastream')({
  component: DataStreamLanding,
});
