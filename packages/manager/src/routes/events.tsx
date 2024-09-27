import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const EventsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Outlet />
    </React.Suspense>
  );
};

export const eventsRoute = createRoute({
  component: EventsRoutes,
  getParentRoute: () => rootRoute,
  path: 'events',
});

const eventsIndexRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Events/EventsLanding'),
    'EventsLanding'
  ),
  getParentRoute: () => eventsRoute,
  path: '/',
});

export const eventsRouteTree = eventsRoute.addChildren([eventsIndexRoute]);
