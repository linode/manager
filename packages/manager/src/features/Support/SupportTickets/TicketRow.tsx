import { SupportTicket } from '@linode/api-v4/lib/support';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';

const useStyles = makeStyles(() => ({
  regarding: {
    lineHeight: 1.1,
  },
}));

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
  const classes = useStyles();

  return (
    <TableRow
      ariaLabel={`Ticket subject ${ticket.summary}`}
      data-qa-support-ticket={ticket.id}
      data-testid="ticket-row"
      key={`ticket-${ticket.id}`}
    >
      <TableCell data-qa-support-subject>
        <Link to={`/support/tickets/${ticket.id}`}>{ticket.summary}</Link>
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-support-id>{ticket.id}</TableCell>
      </Hidden>
      <TableCell className={classes.regarding} data-qa-support-entity>
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
