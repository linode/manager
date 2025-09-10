import { createRoute } from '@tanstack/react-router';

import { mainContentRoute } from '../mainContent';
import { EventsRoute } from './EventsRoute';

const eventsRoute = createRoute({
  component: EventsRoute,
  getParentRoute: () => mainContentRoute,
  path: 'events',
});

const eventsIndexRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Events/eventsLandingLazyRoute').then(
    (m) => m.eventsLandingLazyRoute
  )
);

export const eventsRouteTree = eventsRoute.addChildren([eventsIndexRoute]);
