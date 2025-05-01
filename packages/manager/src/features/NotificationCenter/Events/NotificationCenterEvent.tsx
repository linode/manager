import { useProfile } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import {
  formatProgressEvent,
  getEventMessage,
  getEventUsername,
} from 'src/features/Events/utils';

import {
  NotificationEventAvatar,
  NotificationEventStyledBox,
  notificationEventStyles,
} from '../NotificationCenter.styles';

import type { Event } from '@linode/api-v4/lib/account/types';

interface NotificationEventProps {
  event: Event;
  onClose: () => void;
}

export const NotificationCenterEvent = React.memo(
  (props: NotificationEventProps) => {
    const { event } = props;
    const theme = useTheme();
    const { classes, cx } = notificationEventStyles();
    const unseenEventClass = cx({ [classes.unseenEvent]: !event.seen });
    const message = getEventMessage(event);
    const username = getEventUsername(event);

    const { data: profile } = useProfile();

    /**
     * Some event types may not be handled by our system (or new types or new ones may be added that we haven't caught yet).
     * Filter these out so we don't display blank messages to the user.
     * We have Sentry events being logged for these cases, so we can always go back and add support for them as soon as we become aware.
     */
    if (message === null) {
      return null;
    }

    const { progressEventDate, showProgress } = formatProgressEvent(event);

    return (
      <NotificationEventStyledBox
        className={unseenEventClass}
        data-qa-event={event.id}
        data-qa-event-seen={event.seen}
        data-testid={event.action}
      >
        <NotificationEventAvatar
          color={
            username !== profile?.username
              ? theme.palette.primary.dark
              : undefined
          }
          username={username}
        />

        <Box sx={{ marginTop: '-2px', paddingRight: 1, width: '100%' }}>
          {message}
          {showProgress && (
            <BarPercent
              className={classes.bar}
              max={100}
              narrow
              rounded
              value={event.percent_complete ?? 0}
            />
          )}
          <Typography sx={{ fontSize: '0.8rem' }}>
            {progressEventDate} | {username}
          </Typography>
        </Box>
      </NotificationEventStyledBox>
    );
  }
);
