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
  const target = getLinkTargets(ticket.entity);
  return ticket.entity ? (
    target !== null ? (
      <Link to={target} className="secondaryLink">
        {ticket.entity.label}
      </Link>
    ) : (
      /**
       * Ticket has a labeled entity, but the entity no longer exists (or there was some other problem).
       * Include the label but don't make it a clickable link.
       */
      <Typography>{ticket.entity.label}</Typography>
    )
  ) : /** This ticket doesn't have an entity; leave the link column blank. */
  null;
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
    </TableRow>
  );
};

export default TicketRow;
