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

const supportRoute = createRoute({
  // TODO: TanStackRouter - got to handle the MainContent.tsx `globalErrors.account_unactivated` logic.
  component: SupportTicketsRoutes,
  getParentRoute: () => rootRoute,
  path: 'support',
});

const supportLandingRoute = createRoute({
  getParentRoute: () => supportRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Help/HelpLanding').then((m) => m.helpLandingLazyRoute)
);

const supportTicketsRoute = createRoute({
  getParentRoute: () => supportRoute,
  path: 'tickets',
}).lazy(() =>
  import('src/features/Support/SupportTickets/SupportTicketsLanding').then(
    (m) => m.supportTicketsLandingLazyRoute
  )
);

const supportTicketDetailRoute = createRoute({
  getParentRoute: () => supportRoute,
  parseParams: (params) => ({
    ticketId: Number(params.ticketId),
  }),
  path: 'tickets/$ticketId',
}).lazy(() =>
  import('src/features/Support/SupportTicketDetail/SupportTicketDetail').then(
    (m) => m.supportTicketDetailLazyRoute
  )
);

const supportSearchLandingRoute = createRoute({
  getParentRoute: () => supportRoute,
  path: 'search',
}).lazy(() =>
  import('src/features/Help/SupportSearchLanding/SupportSearchLanding').then(
    (m) => m.supportSearchLandingLazyRoute
  )
);

export const supportRouteTree = supportRoute.addChildren([
  supportLandingRoute,
  supportTicketsRoute.addChildren([supportTicketDetailRoute]),
  supportSearchLandingRoute,
]);
