import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { SupportTicket } from '@linode/api-v4/lib/support';
import { Link } from 'react-router-dom';
import { makeStyles } from 'src/components/core/styles';
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

const TicketRow: React.FC<Props> = ({ ticket }) => {
  const classes = useStyles();

  return (
    <TableRow
      data-qa-support-ticket={ticket.id}
      key={`ticket-${ticket.id}`}
      data-testid="ticket-row"
      ariaLabel={`Ticket subject ${ticket.summary}`}
    >
      <TableCell data-qa-support-subject>
        <Link to={`/support/tickets/${ticket.id}`}>{ticket.summary}</Link>
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-support-id>{ticket.id}</TableCell>
      </Hidden>
      <TableCell data-qa-support-entity className={classes.regarding}>
        {renderEntityLink(ticket)}
      </TableCell>
      <Hidden xsDown>
        <TableCell data-qa-support-date>
          <DateTimeDisplay value={ticket.opened} />
        </TableCell>
      </Hidden>
      <TableCell data-qa-support-updated>
        <DateTimeDisplay value={ticket.updated} />
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-support-updated-by>{ticket.updated_by}</TableCell>
      </Hidden>
    </TableRow>
  );
};

export default TicketRow;
