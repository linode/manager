import { Event } from '@linode/api-v4/lib/account/types';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';
import { getEventMessage } from 'src/features/Events/utils';
import { getEventTimestamp } from 'src/utilities/eventUtils';

import {
  RenderEventGravatar,
  RenderEventStyledBox,
  useRenderEventStyles,
} from './RenderEvent.styles';

interface RenderEventProps {
  event: Event;
  isProgressEvent: boolean;
  onClose: () => void;
}

export const RenderEventV2 = React.memo((props: RenderEventProps) => {
  const { classes, cx } = useRenderEventStyles();
  const { event } = props;
  const message = getEventMessage(event);

  const unseenEventClass = cx({ [classes.unseenEvent]: !event.seen });

  /**
   * Some event types may not be handled by our system (or new types or new ones may be added that we haven't caught yet).
   * Filter these out so we don't display blank messages to the user.
   * We have sentry events being logged for these cases, so we can always go back and add support for them as soon as aware.
   */
  if (message === null) {
    return null;
  }

  return (
    <>
      <RenderEventStyledBox data-test-id={event.action} display="flex">
        <RenderEventGravatar
          sx={{ height: 32, minWidth: 32, mt: '3px', width: 32 }}
          username={event.username}
        />
        <Box sx={{ marginTop: '-2px' }}>
          {message}
          <Typography className={unseenEventClass} sx={{ fontSize: '0.8rem' }}>
            {getEventTimestamp(event).toRelative()}
            {event.username && ` | ${event.username}`}
          </Typography>
        </Box>
      </RenderEventStyledBox>
      <Divider />
    </>
  );
});
