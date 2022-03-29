import { Event, EventAction } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import EntityIcon from 'src/components/EntityIcon';
import Link from 'src/components/Link';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { parseAPIDate } from 'src/utilities/date';
import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import getEventsActionLink from 'src/utilities/getEventsActionLink';
import { formatEventWithUsername } from './Event.helpers';

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    '&:hover': {
      backgroundColor:
        theme.name === 'lightTheme' ? '#fbfbfb' : 'rgba(0, 0, 0, 0.1)',
    },
    '& a': {
      color: 'inherit',
    },
  },
  icon: {
    marginLeft: theme.spacing(1.5),
  },
}));

interface ExtendedEvent extends Event {
  _deleted?: string;
}

interface Props {
  event: ExtendedEvent;
  entityId?: number;
}

type CombinedProps = Props;

export const EventRow: React.FC<CombinedProps> = (props) => {
  const { event, entityId } = props;
  const link = getEventsActionLink(event.action, event.entity, event._deleted);
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const id = pathOr<string | number>(-1, ['entity', 'id'], event);
  const entity = getEntityByIDFromStore(type, id);

  const rowProps = {
    action: event.action,
    entityId,
    link,
    message: eventMessageGenerator(event),
    status: pathOr(undefined, ['status'], entity),
    type,
    created: event.created,
    username: event.username,
  };

  return <Row {...rowProps} data-qa-events-row={event.id} />;
};

export interface RowProps {
  action: EventAction;
  entityId?: number;
  link?: string | (() => void);
  message?: string | void;
  status?: string;
  type:
    | 'linode'
    | 'domain'
    | 'nodebalancer'
    | 'stackscript'
    | 'volume'
    | 'database';
  created: string;
  username: string | null;
}

export const Row: React.FC<RowProps> = (props) => {
  const classes = useStyles();

  const {
    action,
    entityId,
    link,
    message,
    status,
    type,
    created,
    username,
  } = props;

  /** Some event types may not be handled by our system (or new types
   * may be added). Filter these out so we don't display blank messages to the user.
   */
  if (!message) {
    return null;
  }

  const displayedMessage = formatEventWithUsername(action, username, message);

  return (
    <TableRow
      data-qa-event-row
      data-test-id={action}
      ariaLabel={`Event ${displayedMessage}`}
      className={link ? classes.row : ''}
    >
      {/** We don't use the event argument, so typing isn't critical here. */}
      {/* Only display entity icon on the Global EventsLanding page */}
      {!entityId && (
        <TableCell data-qa-event-icon-cell>
          <Hidden smDown>
            <div className={classes.icon}>
              <EntityIcon
                data-qa-entity-icon
                variant={type}
                status={status}
                size={20}
              />
            </div>
          </Hidden>
        </TableCell>
      )}
      <TableCell parentColumn={'Event'} data-qa-event-message-cell>
        <Typography data-qa-event-message variant="body1">
          {link ? <Link to={link}>{displayedMessage}</Link> : displayedMessage}
        </Typography>
      </TableCell>
      <TableCell parentColumn={'Relative Date'}>
        {parseAPIDate(created).toRelative()}
      </TableCell>
      <TableCell parentColumn={'Absolute Date'} data-qa-event-created-cell>
        <DateTimeDisplay value={created} />
      </TableCell>
    </TableRow>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(EventRow);
