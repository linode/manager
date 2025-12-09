import { createLazyRoute } from '@tanstack/react-router';

import { SupportTicketsLanding } from 'src/features/Support/SupportTickets/SupportTicketsLanding';

export const supportTicketsLandingLazyRoute = createLazyRoute(
  '/support/tickets'
)({
  component: SupportTicketsLanding,
});
