import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { EventsRoute } from './EventsRoute';
import { mainContentRoute } from '../mainContent';

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
