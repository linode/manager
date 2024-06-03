// TODO eventMessagesV2: rename to EventRow.tsx when flag is removed
import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getEventTimestamp } from 'src/utilities/eventUtils';

import { getEventMessage } from './utils';

interface EventRowProps {
  entityId?: number;
  event: Event;
}

export const EventRowV2 = (props: EventRowProps) => {
  const { event } = props;
  const timestamp = getEventTimestamp(event);
  const { action, message, username } = {
    action: event.action,
    message: getEventMessage(event),
    username: event.username,
  };

  if (!message) {
    return null;
  }

  return (
    <TableRow data-qa-event-row data-test-id={action}>
      <TableCell data-qa-event-message-cell parentColumn="Event">
        {message}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-event-username-cell parentColumn="Username">
          {username ?? 'Unknown'}
        </TableCell>
      </Hidden>
      <TableCell parentColumn="Relative Date">
        {timestamp.toRelative()}
        {username && (
          <Hidden smUp>
            <br />
            <Box component="span" sx={{ fontSize: '.8rem', lineHeight: 1 }}>
              by {username}
            </Box>
          </Hidden>
        )}
      </TableCell>
      <Hidden mdDown>
        <TableCell data-qa-event-created-cell parentColumn="Absolute Date">
          <DateTimeDisplay value={timestamp.toString()} />
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
