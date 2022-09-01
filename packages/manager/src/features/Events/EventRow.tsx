import { Event, EventAction } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import Link from 'src/components/Link';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { parseAPIDate } from 'src/utilities/date';
import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import getEventsActionLink from 'src/utilities/getEventsActionLink';
import GravatarIcon from '../Profile/DisplaySettings/GravatarIcon';
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
    height: 24,
    width: 24,
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

  const { action, link, message, created, username } = props;

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
      <Hidden xsDown>
        <TableCell data-qa-event-icon-cell>
          <GravatarIcon username={username} className={classes.icon} />
        </TableCell>
      </Hidden>
      <TableCell parentColumn="Event" data-qa-event-message-cell>
        {link ? (
          <Link to={link}>
            <HighlightedMarkdown
              textOrMarkdown={displayedMessage}
              sanitizeOptions={{
                allowedTags: [],
                disallowedTagsMode: 'discard',
              }}
            />
          </Link>
        ) : (
          <HighlightedMarkdown
            textOrMarkdown={displayedMessage}
            sanitizeOptions={{
              allowedTags: [],
              disallowedTagsMode: 'discard',
            }}
          />
        )}
      </TableCell>
      <TableCell parentColumn="Relative Date">
        {parseAPIDate(created).toRelative()}
      </TableCell>
      <Hidden smDown>
        <TableCell parentColumn="Absolute Date" data-qa-event-created-cell>
          <DateTimeDisplay value={created} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(EventRow);
