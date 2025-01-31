import { Box } from '@linode/ui';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { Avatar } from 'src/components/Avatar/Avatar';
import { BarPercent } from 'src/components/BarPercent';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TextTooltip } from 'src/components/TextTooltip';
import { useProfile } from 'src/queries/profile/profile';

import {
  formatProgressEvent,
  getEventMessage,
  getEventUsername,
} from './utils';

import type { Event } from '@linode/api-v4/lib/account';

interface EventRowProps {
  entityId?: number;
  event: Event;
}

export const EventRow = (props: EventRowProps) => {
  const { event } = props;
  const theme = useTheme();
  const { action, message, username } = {
    action: event.action,
    message: getEventMessage(event),
    username: getEventUsername(event),
  };
  const { data: profile } = useProfile();

  if (!message) {
    return null;
  }

  const {
    progressEventDate,
    progressEventDuration,
    showProgress,
  } = formatProgressEvent(event);

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
            <Avatar
              color={
                username !== profile?.username
                  ? theme.palette.primary.dark
                  : undefined
              }
              height={24}
              username={username}
              width={24}
            />
            {username}
          </Box>
        </TableCell>
      </Hidden>
      <TableCell parentColumn="Start Date">
        <TextTooltip
          displayText={progressEventDate}
          minWidth={130}
          placement="top"
          tooltipText={<DateTimeDisplay value={event.created} />}
        />
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
        <TableCell data-qa-event-created-cell parentColumn="Duration">
          {progressEventDuration}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};
