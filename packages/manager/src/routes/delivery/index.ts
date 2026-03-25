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
});

const streamsLandingRoute = createRoute({
  getParentRoute: () => streamsRoute,
  path: '/',
  validateSearch: (search: StreamSearchParams) => search,
}).lazy(() =>
  import('src/features/Delivery/deliveryLandingLazyRoute').then(
    (m) => m.deliveryLandingLazyRoute
  )
);

const streamsCreateRoute = createRoute({
  getParentRoute: () => streamsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Delivery/Streams/StreamForm/streamCreateLazyRoute').then(
    (m) => m.streamCreateLazyRoute
  )
);

const streamRoute = createRoute({
  getParentRoute: () => streamsRoute,
  params: {
    parse: ({ streamId }: { streamId: string }) => ({
      streamId: Number(streamId),
    }),
    stringify: ({ streamId }: { streamId: number }) => ({
      streamId: String(streamId),
    }),
  },
  path: '$streamId',
});

const streamLandingRoute = createRoute({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/logs/delivery/streams/$streamId/summary',
      params: { streamId: params.streamId },
      replace: true,
    });
  },
  getParentRoute: () => streamRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Delivery/Streams/Stream/streamLandingLazyRoute').then(
    (m) => m.streamLandingLazyRoute
  )
);

const streamSummaryRoute = createRoute({
  getParentRoute: () => streamRoute,
  path: 'summary',
}).lazy(() =>
  import('src/features/Delivery/Streams/Stream/streamLandingLazyRoute').then(
    (m) => m.streamLandingLazyRoute
  )
);

const streamMetricsRoute = createRoute({
  beforeLoad: ({ params, context }) => {
    if (!context?.flags?.aclpLogs?.metricsEnabled) {
      throw redirect({
        to: '/logs/delivery/streams/$streamId/summary',
        params: { streamId: params.streamId },
        replace: true,
      });
    }
  },
  getParentRoute: () => streamRoute,
  path: 'metrics',
}).lazy(() =>
  import('src/features/Delivery/Streams/Stream/streamLandingLazyRoute').then(
    (m) => m.streamLandingLazyRoute
  )
);

export interface DestinationSearchParams extends TableSearchParams {
  label?: string;
}

const destinationsRoute = createRoute({
  getParentRoute: () => deliveryRoute,
  path: 'destinations',
  validateSearch: (search: DestinationSearchParams) => search,
});

const destinationsLandingRoute = createRoute({
  getParentRoute: () => destinationsRoute,
  path: '/',
  validateSearch: (search: DestinationSearchParams) => search,
}).lazy(() =>
  import('src/features/Delivery/deliveryLandingLazyRoute').then(
    (m) => m.deliveryLandingLazyRoute
  )
);

const destinationsCreateRoute = createRoute({
  getParentRoute: () => destinationsRoute,
  path: 'create',
}).lazy(() =>
  import(
    'src/features/Delivery/Destinations/DestinationForm/destinationCreateLazyRoute'
  ).then((m) => m.destinationCreateLazyRoute)
);

const destinationRoute = createRoute({
  getParentRoute: () => destinationsRoute,
  params: {
    parse: ({ destinationId }: { destinationId: string }) => ({
      destinationId: Number(destinationId),
    }),
    stringify: ({ destinationId }: { destinationId: number }) => ({
      destinationId: String(destinationId),
    }),
  },
  path: '$destinationId',
});

const destinationLandingRoute = createRoute({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/logs/delivery/destinations/$destinationId/summary',
      params: { destinationId: params.destinationId },
      replace: true,
    });
  },
  getParentRoute: () => destinationRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/Delivery/Destinations/DestinationForm/destinationEditLazyRoute'
  ).then((m) => m.destinationEditLazyRoute)
);

const destinationSummaryRoute = createRoute({
  getParentRoute: () => destinationRoute,
  path: 'summary',
}).lazy(() =>
  import(
    'src/features/Delivery/Destinations/DestinationForm/destinationEditLazyRoute'
  ).then((m) => m.destinationEditLazyRoute)
);

export const deliveryRouteTree = deliveryRoute.addChildren([
  deliveryLandingRoute,
  streamsRoute.addChildren([
    streamsLandingRoute,
    streamsCreateRoute,
    streamRoute.addChildren([
      streamLandingRoute,
      streamSummaryRoute,
      streamMetricsRoute,
    ]),
  ]),
  destinationsRoute.addChildren([
    destinationsLandingRoute,
    destinationsCreateRoute,
    destinationRoute.addChildren([
      destinationLandingRoute,
      destinationSummaryRoute,
    ]),
  ]),
]);
