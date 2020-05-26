import { SupportTicket } from '@linode/api-v4/lib/support';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { ISO_FORMAT } from 'src/constants';
import { getLinkTargets } from 'src/utilities/getEventsActionLink';

interface Props {
  ticket: SupportTicket;
}

type ClassNames = 'summary' | 'regarding';

const styles = () =>
  createStyles({
    summary: {
      lineHeight: 1.1
    },
    regarding: {
      lineHeight: 1.1
    }
  });

type CombinedProps = Props & WithStyles<ClassNames>;

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

const TicketRow: React.FC<CombinedProps> = props => {
  const { ticket, classes } = props;
  return (
    <TableRow
      data-qa-support-ticket={ticket.id}
      key={`ticket-${ticket.id}`}
      rowLink={`/support/tickets/${ticket.id}`}
      data-testid="ticket-row"
      ariaLabel={`Ticket subject ${ticket.summary}`}
    >
      <TableCell parentColumn="Subject" data-qa-support-subject>
        <Link to={`/support/tickets/${ticket.id}`}>
          <Typography variant="h3" className={classes.summary}>
            {ticket.summary}
          </Typography>
        </Link>
      </TableCell>
      <TableCell parentColumn="Ticket ID" data-qa-support-id>
        {ticket.id}
      </TableCell>
      <TableCell
        parentColumn="Regarding"
        data-qa-support-entity
        className={classes.regarding}
      >
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

const styled = withStyles(styles);

export default styled(TicketRow);
