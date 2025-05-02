import { Typography } from '@linode/ui';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

import { SEVERITY_LABEL_MAP } from './constants';
import { useTicketSeverityCapability } from './ticketUtils';

import type { SupportTicket } from '@linode/api-v4/lib/support';

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
  const hasSeverityCapability = useTicketSeverityCapability();

  const ticketSummary = sanitizeHTML({
    disallowedTagsMode: 'discard',
    sanitizingTier: 'none',
    text: ticket.summary,
  }).toString();

  return (
    <TableRow
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
      <Hidden mdDown>
        <TableCell
          data-qa-support-entity
          sx={{
            lineHeight: 1.1,
          }}
        >
          {renderEntityLink(ticket)}
        </TableCell>
      </Hidden>
      {hasSeverityCapability && (
        <TableCell data-qa-support-severity>
          {ticket.severity ? SEVERITY_LABEL_MAP.get(ticket.severity) : ''}
        </TableCell>
      )}
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
