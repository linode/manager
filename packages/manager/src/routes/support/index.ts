import { createRoute } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { SupportTicketsRoute } from './SupportRoute';

interface SupportSearchParams {
  dialogOpen?: boolean;
  dialogTitle?: string;
}

const supportRoute = createRoute({
  // TODO: TanStackRouter - got to handle the MainContent.tsx `globalErrors.account_unactivated` logic.
  component: SupportTicketsRoute,
  getParentRoute: () => rootRoute,
  path: 'support',
});

const supportLandingRoute = createRoute({
  getParentRoute: () => supportRoute,
  path: '/',
}).lazy(() =>
  import('src/features/Help/HelpLanding').then((m) => m.helpLandingLazyRoute)
);

const supportTicketsLandingRoute = createRoute({
  getParentRoute: () => supportRoute,
  path: 'tickets',
  validateSearch: (search: SupportSearchParams) => search,
}).lazy(() =>
  import('./supportLazyRoutes').then((m) => m.supportTicketsLandingLazyRoute)
);

const supportTicketsLandingRouteOpen = createRoute({
  getParentRoute: () => supportRoute,
  path: 'tickets/open',
  validateSearch: (search: SupportSearchParams) => search,
}).lazy(() =>
  import('./supportLazyRoutes').then((m) => m.supportTicketsLandingLazyRoute)
);

const supportTicketsLandingRouteClosed = createRoute({
  getParentRoute: () => supportRoute,
  path: 'tickets/closed',
  validateSearch: (search: SupportSearchParams) => search,
}).lazy(() =>
  import('./supportLazyRoutes').then((m) => m.supportTicketsLandingLazyRoute)
);

const supportTicketDetailRoute = createRoute({
  getParentRoute: () => supportRoute,
  parseParams: (params) => ({
    ticketId: Number(params.ticketId),
  }),
  path: 'tickets/$ticketId',
}).lazy(() =>
  import('./supportLazyRoutes').then((m) => m.supportTicketDetailLazyRoute)
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
  supportTicketsLandingRoute,
  supportTicketDetailRoute.addChildren([
    supportTicketsLandingRouteOpen,
    supportTicketsLandingRouteClosed,
  ]),
  supportSearchLandingRoute,
]);
