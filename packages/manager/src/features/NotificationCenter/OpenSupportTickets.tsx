import * as React from 'react';
import { Link } from 'react-router-dom';
import TicketIcon from 'src/assets/icons/ticket.svg';
import Typography from 'src/components/core/Typography';
import NotificationSection, { NotificationItem } from './NotificationSection';

export const OpenSupportTickets: React.FC<{}> = _ => {
  const openTickets: NotificationItem[] = [
    {
      id: 'ticket-12345',
      body: (
        <Typography>
          <Link to="/support/tickets/1">Support ticket 1</Link> was updated by
          jjones
        </Typography>
      ),
      timeStamp: '2020-07-20T19:03:37'
    }
  ];
  return (
    <NotificationSection
      content={openTickets}
      header="Open Support Tickets"
      icon={<TicketIcon />}
    />
  );
};

export default React.memo(OpenSupportTickets);
