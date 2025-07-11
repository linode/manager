import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DataStreamRoute } from './DataStreamRoute';

export const dataStreamRoute = createRoute({
  component: DataStreamRoute,
  getParentRoute: () => rootRoute,
  path: 'datastream',
});

const dataStreamLandingRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ to: '/datastream/streams' });
  },
  getParentRoute: () => dataStreamRoute,
  path: '/',
}).lazy(() =>
  import('./dataStreamLazyRoutes').then((m) => m.dataStreamLandingLazyRoute)
);

const streamsRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'streams',
}).lazy(() =>
  import('./dataStreamLazyRoutes').then((m) => m.dataStreamLandingLazyRoute)
);

const streamsCreateRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'streams/create',
}).lazy(() =>
  import('./dataStreamLazyRoutes').then((m) => m.streamCreateLazyRoute)
);

const destinationsRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'destinations',
}).lazy(() =>
  import('./dataStreamLazyRoutes').then((m) => m.dataStreamLandingLazyRoute)
);

const destinationsCreateRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'destinations/create',
}).lazy(() =>
  import('./dataStreamLazyRoutes').then((m) => m.destinationCreateLazyRoute)
);

export const dataStreamRouteTree = dataStreamRoute.addChildren([
  dataStreamLandingRoute,
  streamsRoute.addChildren([streamsCreateRoute]),
  destinationsRoute.addChildren([destinationsCreateRoute]),
]);
