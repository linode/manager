import { Event } from '@linode/api-v4/lib/account/types';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { Typography } from 'src/components/Typography';
import { getEventMessage } from 'src/features/Events/utils';
import { useFlags } from 'src/hooks/useFlags';
import { getEventTimestamp } from 'src/utilities/eventUtils';
import { getAllowedHTMLTags } from 'src/utilities/sanitizeHTML.utils';

import {
  RenderEventGravatar,
  RenderEventStyledBox,
  useRenderEventStyles,
} from './RenderEvent.styles';
import useEventInfo from './useEventInfo';

interface RenderEventProps {
  event: Event;
  onClose: () => void;
}

export const RenderEvent = React.memo((props: RenderEventProps) => {
  const flags = useFlags();
  const { classes, cx } = useRenderEventStyles();
  const { event } = props;
  const { message } = useEventInfo(event);
  const messageV2 = getEventMessage(event);

  const unseenEventClass = cx({ [classes.unseenEvent]: !event.seen });

  if (message === null) {
    return null;
  }

  const eventMessage = (
    <div className={unseenEventClass}>
      <HighlightedMarkdown
        sanitizeOptions={{
          ALLOWED_TAGS: getAllowedHTMLTags('strict'),
          disallowedTagsMode: 'discard',
        }}
        textOrMarkdown={message}
      />
    </div>
  );

  if (flags.eventMessagesV2) {
    return (
      /**
       * Some event types may not be handled by our system (or new types or new ones may be added that we haven't caught yet).
       * Filter these out so we don't display blank messages to the user.
       * We have sentry events being logged for these cases, so we can always go back and add support for them as soon as aware.
       */
      messageV2 ? (
        <>
          <RenderEventStyledBox data-test-id={event.action} display="flex">
            <RenderEventGravatar
              sx={{ height: 32, minWidth: 32, mt: '3px', width: 32 }}
              username={event.username}
            />
            <Box sx={{ marginTop: '-2px' }}>
              {messageV2}
              <Typography className={unseenEventClass}>
                {getEventTimestamp(event).toRelative()} | {event.username}
              </Typography>
            </Box>
          </RenderEventStyledBox>
          <Divider />
        </>
      ) : null
    );
  }

  return (
    <>
      <RenderEventStyledBox data-test-id={event.action} display="flex">
        <RenderEventGravatar username={event.username} />
        <Box sx={{ marginTop: '-2px' }}>
          {eventMessage}
          <Typography className={unseenEventClass}>
            {getEventTimestamp(event).toRelative()}
          </Typography>
        </Box>
      </RenderEventStyledBox>
      <Divider />
    </>
  );
});
