import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { EventsRoute } from './EventsRoute';

const eventsRoute = createRoute({
  component: EventsRoute,
  getParentRoute: () => rootRoute,
  path: 'events',
});

const eventsIndexRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Events/EventsLanding').then(
    (m) => m.eventsLandingLazyRoute
  )
);

export const eventsRouteTree = eventsRoute.addChildren([eventsIndexRoute]);
