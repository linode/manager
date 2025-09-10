import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DataStreamRoute } from './DataStreamRoute';

import type { TableSearchParams } from 'src/routes/types';
import { mainContentRoute } from '../mainContent';

export interface StreamSearchParams extends TableSearchParams {
  label?: string;
  status?: string;
}

export const dataStreamRoute = createRoute({
  component: DataStreamRoute,
  getParentRoute: () => mainContentRoute,
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
    'src/features/DataStream/Streams/StreamForm/streamCreateLazyRoute'
  ).then((m) => m.streamCreateLazyRoute)
);

const streamsEditRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  params: {
    parse: ({ streamId }: { streamId: string }) => ({
      streamId: Number(streamId),
    }),
    stringify: ({ streamId }: { streamId: number }) => ({
      streamId: String(streamId),
    }),
  },
  path: 'streams/$streamId/edit',
}).lazy(() =>
  import('src/features/DataStream/Streams/StreamForm/streamEditLazyRoute').then(
    (m) => m.streamEditLazyRoute
  )
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
    'src/features/DataStream/Destinations/DestinationForm/destinationCreateLazyRoute'
  ).then((m) => m.destinationCreateLazyRoute)
);

const destinationsEditRoute = createRoute({
  getParentRoute: () => dataStreamRoute,
  params: {
    parse: ({ destinationId }: { destinationId: string }) => ({
      destinationId: Number(destinationId),
    }),
    stringify: ({ destinationId }: { destinationId: number }) => ({
      destinationId: String(destinationId),
    }),
  },
  path: 'destinations/$destinationId/edit',
}).lazy(() =>
  import(
    'src/features/DataStream/Destinations/DestinationForm/destinationEditLazyRoute'
  ).then((m) => m.destinationEditLazyRoute)
);

export const dataStreamRouteTree = dataStreamRoute.addChildren([
  dataStreamLandingRoute,
  streamsRoute.addChildren([streamsCreateRoute, streamsEditRoute]),
  destinationsRoute.addChildren([
    destinationsCreateRoute,
    destinationsEditRoute,
  ]),
]);
