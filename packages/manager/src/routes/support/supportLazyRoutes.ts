import { createLazyRoute } from '@tanstack/react-router';

import { AccountActivationLanding } from 'src/components/AccountActivation/AccountActivationLanding';
import { SupportTicketDetail } from 'src/features/Support/SupportTicketDetail/SupportTicketDetail';
import { SupportTicketsLanding } from 'src/features/Support/SupportTickets/SupportTicketsLanding';

export const supportTicketsLandingLazyRoute = createLazyRoute(
  '/support/tickets'
)({
  component: SupportTicketsLanding,
});

export const supportTicketDetailLazyRoute = createLazyRoute(
  '/support/tickets/$ticketId'
)({
  component: SupportTicketDetail,
});

export const accountActivationLandingLazyRoute = createLazyRoute(
  '/account-activation'
)({
  component: AccountActivationLanding,
});
