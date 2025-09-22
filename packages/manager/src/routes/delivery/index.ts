import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { DeliveryRoute } from './DeliveryRoute';

import type { TableSearchParams } from 'src/routes/types';

export interface StreamSearchParams extends TableSearchParams {
  label?: string;
  status?: string;
}

export const deliveryRoute = createRoute({
  component: DeliveryRoute,
  getParentRoute: () => rootRoute,
  path: 'logs/delivery',
});

const deliveryLandingRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ to: '/logs/delivery/streams' });
  },
  getParentRoute: () => deliveryRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Delivery/deliveryLandingLazyRoute').then(
    (m) => m.deliveryLandingLazyRoute
  )
);

const streamsRoute = createRoute({
  getParentRoute: () => deliveryRoute,
  path: 'streams',
  validateSearch: (search: StreamSearchParams) => search,
}).lazy(() =>
  import('src/features/Delivery/deliveryLandingLazyRoute').then(
    (m) => m.deliveryLandingLazyRoute
  )
);

const streamsCreateRoute = createRoute({
  getParentRoute: () => deliveryRoute,
  path: 'streams/create',
}).lazy(() =>
  import('src/features/Delivery/Streams/StreamForm/streamCreateLazyRoute').then(
    (m) => m.streamCreateLazyRoute
  )
);

const streamsEditRoute = createRoute({
  getParentRoute: () => deliveryRoute,
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
  import('src/features/Delivery/Streams/StreamForm/streamEditLazyRoute').then(
    (m) => m.streamEditLazyRoute
  )
);

export interface DestinationSearchParams extends TableSearchParams {
  label?: string;
}

const destinationsRoute = createRoute({
  getParentRoute: () => deliveryRoute,
  path: 'destinations',
  validateSearch: (search: DestinationSearchParams) => search,
}).lazy(() =>
  import('src/features/Delivery/deliveryLandingLazyRoute').then(
    (m) => m.deliveryLandingLazyRoute
  )
);

const destinationsCreateRoute = createRoute({
  getParentRoute: () => deliveryRoute,
  path: 'destinations/create',
}).lazy(() =>
  import(
    'src/features/Delivery/Destinations/DestinationForm/destinationCreateLazyRoute'
  ).then((m) => m.destinationCreateLazyRoute)
);

const destinationsEditRoute = createRoute({
  getParentRoute: () => deliveryRoute,
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
    'src/features/Delivery/Destinations/DestinationForm/destinationEditLazyRoute'
  ).then((m) => m.destinationEditLazyRoute)
);

export const deliveryRouteTree = deliveryRoute.addChildren([
  deliveryLandingRoute,
  streamsRoute.addChildren([streamsCreateRoute, streamsEditRoute]),
  destinationsRoute.addChildren([
    destinationsCreateRoute,
    destinationsEditRoute,
  ]),
]);
