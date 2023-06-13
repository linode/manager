import { Event, EventAction } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import renderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import { getLinkForEvent } from 'src/utilities/getEventsActionLink';
import { GravatarByUsername } from '../../components/GravatarByUsername';
import { useApplicationStore } from 'src/store';
import { getEventTimestamp } from 'src/utilities/eventUtils';
import { DateTime } from 'luxon';

const useStyles = makeStyles((theme: Theme) => ({
  row: {
    '&:hover': {
      backgroundColor:
        theme.name === 'light' ? '#fbfbfb' : 'rgba(0, 0, 0, 0.1)',
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
  const store = useApplicationStore();
  const link = getLinkForEvent(event.action, event.entity, event._deleted);
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const id = pathOr<string | number>(-1, ['entity', 'id'], event);
  const entity = getEntityByIDFromStore(type, id, store);
  const timestamp = getEventTimestamp(event);

  const rowProps = {
    action: event.action,
    entityId,
    link,
    message: eventMessageGenerator(event),
    status: pathOr(undefined, ['status'], entity),
    type,
    username: event.username,
    timestamp,
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
  username: string | null;
  timestamp: DateTime;
}

export const Row: React.FC<RowProps> = (props) => {
  const classes = useStyles();

  const { action, message, timestamp, username } = props;

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
      ariaLabel={`Event ${message}`}
      className={classes.row}
    >
      <Hidden smDown>
        <TableCell data-qa-event-icon-cell>
          <GravatarByUsername
            username={username ?? ''}
            className={classes.icon}
          />
        </TableCell>
      </Hidden>
      <TableCell parentColumn="Event" data-qa-event-message-cell>
        <HighlightedMarkdown
          textOrMarkdown={message}
          sanitizeOptions={{
            allowedTags: ['a'],
            disallowedTagsMode: 'discard',
          }}
        />
      </TableCell>
      <TableCell parentColumn="Relative Date">
        {timestamp.toRelative()}
      </TableCell>
      <Hidden mdDown>
        <TableCell parentColumn="Absolute Date" data-qa-event-created-cell>
          <DateTimeDisplay value={timestamp.toString()} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

const enhanced = compose<CombinedProps, Props & RenderGuardProps>(renderGuard);

export default enhanced(EventRow);
