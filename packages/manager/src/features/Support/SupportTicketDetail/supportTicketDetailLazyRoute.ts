import { createLazyRoute } from '@tanstack/react-router';

import { SupportTicketDetail } from './SupportTicketDetail';

export const supportTicketDetailLazyRoute = createLazyRoute(
  '/support/tickets/$ticketId'
)({
  component: SupportTicketDetail,
});
