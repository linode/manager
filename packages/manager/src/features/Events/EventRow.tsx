import { Event, EventAction } from '@linode/api-v4/lib/account';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { DateTime } from 'luxon';
import { pathOr } from 'ramda';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { RenderGuard } from 'src/components/RenderGuard';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { getEventTimestamp } from 'src/utilities/eventUtils';
import { getLinkForEvent } from 'src/utilities/getEventsActionLink';

import { GravatarByUsername } from '../../components/GravatarByUsername';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    height: 24,
    width: 24,
  },
  row: {
    '&:hover': {
      backgroundColor:
        theme.name === 'light' ? '#fbfbfb' : 'rgba(0, 0, 0, 0.1)',
    },
  },
}));

interface ExtendedEvent extends Event {
  _deleted?: string;
}

interface Props {
  entityId?: number;
  event: ExtendedEvent;
}

type CombinedProps = Props;

export const EventRow: React.FC<CombinedProps> = (props) => {
  const { entityId, event } = props;
  const link = getLinkForEvent(event.action, event.entity, event._deleted);
  const type = pathOr<string>('linode', ['entity', 'type'], event);
  const timestamp = getEventTimestamp(event);

  const rowProps = {
    action: event.action,
    entityId,
    link,
    message: eventMessageGenerator(event),
    timestamp,
    type,
    username: event.username,
  };

  return <Row {...rowProps} data-qa-events-row={event.id} />;
};

export interface RowProps {
  action: EventAction;
  link?: (() => void) | string;
  message?: string | void;
  status?: string;
  timestamp: DateTime;
  type:
    | 'database'
    | 'domain'
    | 'linode'
    | 'nodebalancer'
    | 'stackscript'
    | 'volume';
  username: null | string;
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
      ariaLabel={`Event ${message}`}
      className={classes.row}
      data-qa-event-row
      data-test-id={action}
    >
      <Hidden smDown>
        <TableCell data-qa-event-icon-cell>
          <GravatarByUsername
            className={classes.icon}
            username={username ?? ''}
          />
        </TableCell>
      </Hidden>
      <TableCell data-qa-event-message-cell parentColumn="Event">
        <HighlightedMarkdown
          sanitizeOptions={{
            allowedTags: ['a'],
            disallowedTagsMode: 'discard',
          }}
          textOrMarkdown={message}
        />
      </TableCell>
      <TableCell parentColumn="Relative Date">
        {timestamp.toRelative()}
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-event-created-cell parentColumn="Absolute Date">
          <DateTimeDisplay value={timestamp.toString()} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default RenderGuard(EventRow);
