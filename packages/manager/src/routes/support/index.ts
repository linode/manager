import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { SupportTicketsRoute } from './SupportRoute';

import type { AttachmentError } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import type { SupportTicketFormFields } from 'src/features/Support/SupportTickets/SupportTicketDialog';

interface SupportSearchParams {
  dialogOpen?: boolean;
}

export interface SupportState {
  attachmentErrors?: AttachmentError[];
  supportTicketFormFields?: SupportTicketFormFields;
}

const supportRoute = createRoute({
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

export const accountActivationLandingRoute = createRoute({
  beforeLoad: async ({ context }) => {
    if (!context.globalErrors?.account_unactivated) {
      throw redirect({ to: '/' });
    }
    return true;
  },
  getParentRoute: () => rootRoute,
  path: 'account-activation',
}).lazy(() =>
  import('./supportLazyRoutes').then((m) => m.accountActivationLandingLazyRoute)
);

export const supportRouteTree = supportRoute.addChildren([
  supportLandingRoute,
  supportTicketsLandingRoute.addChildren([
    supportTicketDetailRoute,
    supportTicketsLandingRouteOpen,
    supportTicketsLandingRouteClosed,
  ]),
  supportSearchLandingRoute,
  accountActivationLandingRoute,
]);
