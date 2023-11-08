import { SupportTicket } from '@linode/api-v4/lib/support';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

interface Props {
  ticket: SupportTicket;
}

const renderEntityLink = (ticket: SupportTicket) => {
  const target = getLinkTargets(ticket.entity);
  return ticket.entity ? (
    target !== null ? (
      <Link className="secondaryLink" to={target}>
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

export const TicketRow = ({ ticket }: Props) => {
  const ticketSummary = sanitizeHTML({
    disallowedTagsMode: 'discard',
    sanitizingTier: 'none',
    text: ticket.summary,
  }).toString();

  return (
    <TableRow
      ariaLabel={`Ticket subject ${ticketSummary}`}
      data-qa-support-ticket={ticket.id}
      data-testid="ticket-row"
      key={`ticket-${ticket.id}`}
    >
      <TableCell data-qa-support-subject>
        <Link to={`/support/tickets/${ticket.id}`}>{ticketSummary}</Link>
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-support-id>{ticket.id}</TableCell>
      </Hidden>
      <TableCell
        sx={{
          lineHeight: 1.1,
        }}
        data-qa-support-entity
      >
        {renderEntityLink(ticket)}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-support-date>
          <DateTimeDisplay value={ticket.opened} />
        </TableCell>
      </Hidden>
      <TableCell data-qa-support-updated>
        <DateTimeDisplay value={ticket.updated} />
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-support-updated-by>{ticket.updated_by}</TableCell>
      </Hidden>
    </TableRow>
  );
};
