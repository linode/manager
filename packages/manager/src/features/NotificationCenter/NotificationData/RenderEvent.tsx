// TODO eventMessagesV2: delete when flag is removed
import { Event } from '@linode/api-v4/lib/account/types';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { Typography } from 'src/components/Typography';
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
  const { classes, cx } = useRenderEventStyles();
  const { event } = props;
  const { message } = useEventInfo(event);

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
