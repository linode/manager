import { SupportTicket } from '@linode/api-v4/lib/support';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getTicketsPage } from 'src/features/Support/SupportTickets/ticketUtils';
import NotificationSection, { NotificationItem } from './NotificationSection';

export const OpenSupportTickets: React.FC<{}> = _ => {
  /**
   * Unlike some other sections of the notifications center,
   * we want to show all open support tickets, not just ones
   * that have been updated since the user's last login.
   *
   * Fortunately, the SupportTicket object makes this easy;
   * we just have to request a user's open tickets here,
   * since these are never cached in Redux.
   */
  const ticketsRequest = useAPIRequest(
    () =>
      getTicketsPage({}, {}, 'open').then(response =>
        response.data.map(ticketToNotification)
      ),
    []
  );

  if (ticketsRequest.error) {
    // Open for debate. I'd like to avoid showing separate
    // error states for all of these, as they take up screen
    // real estate.
    return null;
  }

  return (
    <NotificationSection
      content={ticketsRequest.data}
      header="Open Support Tickets"
      showMoreText="View all tickets"
      showMoreTarget="/support/tickets"
      loading={ticketsRequest.loading}
    />
  );
};

const ticketToNotification = (ticket: SupportTicket): NotificationItem => {
  return {
    id: `ticket-notification-item-${ticket.id}`,
    body: (
      <Typography>
        <Link to={`/support/tickets/${ticket.id}`}>
          #{ticket.id} {ticket.summary}
        </Link>{' '}
        {/** updated_by is nullable, but opened_by is guaranteed to be defined */}
        {ticket.updated_by
          ? `was updated by ${ticket.updated_by}`
          : `was opened by ${ticket.opened_by}`}
      </Typography>
    ),
    timeStamp: ticket.updated || ticket.opened
  };
};

export default React.memo(OpenSupportTickets);
