import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { StatusBanners } from 'src/features/Help/StatusBanners';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const SupportTicketsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <StatusBanners />
      <Outlet />
    </React.Suspense>
  );
};

const SupportRoute = createRoute({
  component: SupportTicketsRoutes,
  getParentRoute: () => rootRoute,
  path: 'support',
});

const SupportLandingRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Help/HelpLanding'),
    'HelpLanding'
  ),
  getParentRoute: () => SupportRoute,
  path: '/',
});

const SupportTicketsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Support/SupportTickets/SupportTicketsLanding')
  ),
  getParentRoute: () => SupportRoute,
  path: 'tickets',
});

const SupportTicketDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import('src/features/Support/SupportTicketDetail/SupportTicketDetail'),
    'SupportTicketDetail'
  ),
  getParentRoute: () => SupportTicketsRoute,
  path: '$ticketId',
});

const SupportSearchLandingRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Help/SupportSearchLanding/SupportSearchLanding')
  ),
  getParentRoute: () => SupportRoute,
  path: 'search',
});

export const supportRouteTree = SupportRoute.addChildren([
  SupportLandingRoute,
  SupportTicketsRoute.addChildren([SupportTicketDetailRoute]),
  SupportSearchLandingRoute,
]);
