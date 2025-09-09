import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DataStreamRoute } from './DataStreamRoute';

import type { TableSearchParams } from 'src/routes/types';

export interface StreamSearchParams extends TableSearchParams {
  label?: string;
  status?: string;
}

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
  import('src/features/DataStream/dataStreamLandingLazyRoute').then(
    (m) => m.dataStreamLandingLazyRoute
  )
);

const streamsRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'streams',
  validateSearch: (search: StreamSearchParams) => search,
}).lazy(() =>
  import('src/features/DataStream/dataStreamLandingLazyRoute').then(
    (m) => m.dataStreamLandingLazyRoute
  )
);

const streamsCreateRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'streams/create',
}).lazy(() =>
  import(
    'src/features/DataStream/Streams/StreamCreate/streamCreateLazyRoute'
  ).then((m) => m.streamCreateLazyRoute)
);

export interface DestinationSearchParams extends TableSearchParams {
  label?: string;
}

const destinationsRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'destinations',
  validateSearch: (search: DestinationSearchParams) => search,
}).lazy(() =>
  import('src/features/DataStream/dataStreamLandingLazyRoute').then(
    (m) => m.dataStreamLandingLazyRoute
  )
);

const destinationsCreateRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  path: 'destinations/create',
}).lazy(() =>
  import(
    'src/features/DataStream/Destinations/DestinationCreate/destinationCreateLazyRoute'
  ).then((m) => m.destinationCreateLazyRoute)
);

export const dataStreamRouteTree = dataStreamRoute.addChildren([
  dataStreamLandingRoute,
  streamsRoute.addChildren([streamsCreateRoute]),
  destinationsRoute.addChildren([destinationsCreateRoute]),
]);
