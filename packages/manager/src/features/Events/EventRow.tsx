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

interface Message {
  message: string;
  displayJSX: string | JSX.Element;
}

type CombinedProps = Props;

const displayMessageJSX = (event: ExtendedEvent): Message => {
  const message = eventMessageGenerator(event);
  const formattedMessage = formatEventWithUsername(
    event.action,
    event.username,
    message
  );
  const entityLabelMatch = formattedMessage.match(
    new RegExp(event!.entity!.label)
  );
  const usernameMatch = formattedMessage.match(new RegExp(event.username));

  if (!entityLabelMatch || !usernameMatch) {
    return {
      message: formattedMessage,
      displayJSX: formattedMessage,
    };
  }

  const displayJSX = (
    <>
      {formattedMessage.substring(0, entityLabelMatch.index)}
      <strong>{entityLabelMatch[0]}</strong>
      {formattedMessage.substring(
        Number(entityLabelMatch.index) + entityLabelMatch[0].length,
        usernameMatch.index
      )}
      <strong>{usernameMatch[0]}</strong>
    </>
  );

  return {
    message,
    displayJSX,
  };
};

export const EventRow: React.FC<CombinedProps> = (props) => {
  const { event, entityId } = props;
  const link = getEventsActionLink(event.action, event.entity, event._deleted);
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const id = pathOr<string | number>(-1, ['entity', 'id'], event);
  const entity = getEntityByIDFromStore(type, id);
  const message = displayMessageJSX(event);

  const rowProps = {
    action: event.action,
    entityId,
    link,
    message,
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
  message?: Message;
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

  const { action, entityId, link, message, status, type, created } = props;

  /** Some event types may not be handled by our system (or new types
   * may be added). Filter these out so we don't display blank messages to the user.
   */
  if (!message) {
    return null;
  }

  return (
    <TableRow
      data-qa-event-row
      data-test-id={action}
      ariaLabel={`Event ${message.message}`}
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
          {link ? (
            <Link to={link}>{message.displayJSX}</Link>
          ) : (
            message.displayJSX
          )}
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
