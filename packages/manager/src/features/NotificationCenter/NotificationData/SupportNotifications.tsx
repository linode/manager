import { SupportTicket } from '@linode/api-v4/lib/support';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useNotifications from 'src/hooks/useNotifications';
import { getTicketsPage } from 'src/features/Support/SupportTickets/ticketUtils';
import { NotificationItem } from '../NotificationSection';

const useStyles = makeStyles(() => ({
  abuseTicket: {
    position: 'relative',
    color: '#cf1e1e',
    fontWeight: 'bold',
    paddingLeft: '18px',
    '&:before': {
      content: "'!'",
      width: '15px',
      height: '15px',
      textAlign: 'center',
      borderRadius: '50%',
      backgroundColor: '#cf1e1e',
      color: 'white',
      position: 'absolute',
      left: 0,
      top: 0
    }
  }
}));

export const SupportNotifications = () => {
  const notifications = useNotifications();
  const abuseTickets = notifications.filter(
    thisNotification => thisNotification.type === 'ticket_abuse'
  );

  const classes = useStyles();

  /**
   * Unlike some other sections of the notifications center,
   * we want to show all open support tickets, not just ones
   * that have been updated since the user's last login.
   *
   * Fortunately, the SupportTicket object makes this easy;
   * we just have to request a user's open tickets here,
   * since these are never cached in Redux.
   */
  return useAPIRequest<NotificationItem[]>(
    () =>
      getTicketsPage({}, {}, 'open').then(response =>
        response.data.map(thisTicket => {
          // If we have a ticket with a type of ticket_abuse
          // and its entity.id matches the current ticket, we've
          // found an abuse ticket and should mark it as such.
          const idx = abuseTickets.findIndex(
            thisNotification => thisNotification.entity?.id === thisTicket.id
          );
          const type = idx > -1 ? 'abuse' : 'normal';
          return ticketToNotification(thisTicket, classes, type);
        })
      ),
    []
  );
};

type TicketType = 'normal' | 'important' | 'abuse';
const ticketToNotification = (
  ticket: SupportTicket,
  classes: Record<string, string>,
  type: TicketType = 'normal'
): NotificationItem => {
  const isAbuse = type === 'abuse';
  return {
    id: `ticket-notification-item-${ticket.id}`,
    body: (
      <Typography>
        <Link
          to={`/support/tickets/${ticket.id}`}
          className={isAbuse ? classes.abuseTicket : undefined}
        >
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

export default SupportNotifications;
