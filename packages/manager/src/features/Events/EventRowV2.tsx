// TODO eventMessagesV2: rename to EventRow.tsx when flag is removed
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import { Box } from 'src/components/Box';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { getEventTimestamp } from 'src/utilities/eventUtils';

import { StyledGravatar } from './EventRow.styles';
import { formatProgressEvent, getEventMessage } from './utils';

import type { Event } from '@linode/api-v4/lib/account';

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

  const { progressEventDisplay, showProgress } = formatProgressEvent(event);

  return (
    <TableRow data-qa-event-row data-test-id={action}>
      <TableCell data-qa-event-message-cell parentColumn="Event">
        <Box sx={{ mt: showProgress ? 0.5 : 0 }}>{message}</Box>
        {showProgress && (
          <BarPercent
            max={100}
            narrow
            rounded
            sx={{ mb: 1, mt: 0.5 }}
            value={event.percent_complete ?? 0}
          />
        )}
      </TableCell>
      <Hidden smDown>
        <TableCell data-qa-event-username-cell parentColumn="Username">
          <Box alignItems="center" display="flex" gap={1}>
            <StyledGravatar username={username ?? ''} />
            {username ?? 'Linode'}
          </Box>
        </TableCell>
      </Hidden>
      <TableCell parentColumn="Relative Date">
        {progressEventDisplay}
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
