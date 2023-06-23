import { Event } from '@linode/api-v4/lib/account/types';
import classNames from 'classnames';
import * as React from 'react';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Typography from 'src/components/core/Typography';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { useApplicationStore } from 'src/store';
import { getEventTimestamp } from 'src/utilities/eventUtils';
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
  const store = useApplicationStore();
  const { classes } = useRenderEventStyles();
  const { event } = props;
  const { message } = useEventInfo(event, store);

  const unseenEventClass = classNames({ [classes.unseenEvent]: !event.seen });

  if (message === null) {
    return null;
  }

  const eventMessage = (
    <div className={unseenEventClass}>
      <HighlightedMarkdown textOrMarkdown={message} />
    </div>
  );

  return (
    <>
      <RenderEventStyledBox display="flex" data-test-id={event.action}>
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
