import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import {
  formatProgressEvent,
  getEventMessage,
} from 'src/features/Events/utils';

import {
  RenderEventGravatarV2,
  RenderEventStyledBox,
  useRenderEventStyles,
} from './RenderEvent.styles';

import type { Event } from '@linode/api-v4/lib/account/types';

interface RenderEventProps {
  event: Event;
  onClose: () => void;
}

export const RenderEventV2 = React.memo((props: RenderEventProps) => {
  const { event } = props;
  const { classes, cx } = useRenderEventStyles();
  const unseenEventClass = cx({ [classes.unseenEventV2]: !event.seen });
  const message = getEventMessage(event);

  /**
   * Some event types may not be handled by our system (or new types or new ones may be added that we haven't caught yet).
   * Filter these out so we don't display blank messages to the user.
   * We have Sentry events being logged for these cases, so we can always go back and add support for them as soon as we become aware.
   */
  if (message === null) {
    return null;
  }

  const { progressEventDisplay, showProgress } = formatProgressEvent(event);

  return (
    <RenderEventStyledBox
      className={unseenEventClass}
      data-testid={event.action}
    >
      <RenderEventGravatarV2 username={event.username} />
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
          {progressEventDisplay} | {event.username ?? 'Linode'}
        </Typography>
      </Box>
    </RenderEventStyledBox>
  );
});
