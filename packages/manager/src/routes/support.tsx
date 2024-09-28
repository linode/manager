import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { StatusBanners } from 'src/features/Help/StatusBanners';

import { rootRoute } from './root';

export const SupportTicketsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <StatusBanners />
      <Outlet />
    </React.Suspense>
  );
};

const SupportRoute = createRoute({
  // TODO: TanStackRouter - got to handle the MainContent.tsx `globalErrors.account_unactivated` logic.
  component: SupportTicketsRoutes,
  getParentRoute: () => rootRoute,
  path: 'support',
});

const SupportLandingRoute = createRoute({
  getParentRoute: () => SupportRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Help/HelpLanding').then((m) => m.helpLandingLazyRoute)
);

const SupportTicketsRoute = createRoute({
  getParentRoute: () => SupportRoute,
  path: 'tickets',
}).lazy(() =>
  import('src/features/Support/SupportTickets/SupportTicketsLanding').then(
    (m) => m.supportTicketsLandingLazyRoute
  )
);

const SupportTicketDetailRoute = createRoute({
  getParentRoute: () => SupportTicketsRoute,
  parseParams: (params) => ({
    ticketId: Number(params.ticketId),
  }),
  path: '$ticketId',
}).lazy(() =>
  import('src/features/Support/SupportTicketDetail/SupportTicketDetail').then(
    (m) => m.supportTicketDetailLazyRoute
  )
);

const SupportSearchLandingRoute = createRoute({
  getParentRoute: () => SupportRoute,
  path: 'search',
}).lazy(() =>
  import('src/features/Help/SupportSearchLanding/SupportSearchLanding').then(
    (m) => m.supportSearchLandingLazyRoute
  )
);

export const supportRouteTree = SupportRoute.addChildren([
  SupportLandingRoute,
  SupportTicketsRoute.addChildren([SupportTicketDetailRoute]),
  SupportSearchLandingRoute,
]);
