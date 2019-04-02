import * as React from 'react';
import { Link } from 'react-router-dom';

import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import { ISO_FORMAT } from 'src/constants';

import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';

interface Props {
  ticket: Linode.SupportTicket;
}

const renderEntityLink = (ticket: Linode.SupportTicket) => {
  return ticket.entity ? (
    <Link to={getLinkTargets(ticket.entity)} className="secondaryLink">
      {ticket.entity.label}
    </Link>
  ) : null;
};

const TicketRow: React.StatelessComponent<Props> = props => {
  const { ticket } = props;
  return (
    <TableRow
      data-qa-support-ticket={ticket.id}
      key={`ticket-${ticket.id}`}
      rowLink={`/support/tickets/${ticket.id}`}
    >
      <TableCell parentColumn="Subject" data-qa-support-subject>
        <Link to={`/support/tickets/${ticket.id}`}>
          <Typography variant="h3">{ticket.summary}</Typography>
        </Link>
      </TableCell>
      <TableCell parentColumn="Ticket ID" data-qa-support-id>
        {ticket.id}
      </TableCell>
      <TableCell parentColumn="Regarding" data-qa-support-entity>
        {renderEntityLink(ticket)}
      </TableCell>
      <TableCell parentColumn="Date Created" data-qa-support-date>
        <DateTimeDisplay value={ticket.opened} format={ISO_FORMAT} />
      </TableCell>
      <TableCell parentColumn="Last Updated" data-qa-support-updated>
        <DateTimeDisplay value={ticket.updated} format={ISO_FORMAT} />
      </TableCell>
      <TableCell parentColumn="Updated By" data-qa-support-updated-by>
        {ticket.updated_by}
      </TableCell>
      <TableCell />
    </TableRow>
  );
};

export default TicketRow;
