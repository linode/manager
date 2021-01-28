import { Event } from '@linode/api-v4/lib/account/types';
import { partition } from 'ramda';
import * as React from 'react';
import useEvents from 'src/hooks/useEvents';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import { NotificationItem } from '../NotificationSection';
import RenderEvent from './RenderEvent';
import RenderProgressEvent from './RenderProgressEvent';

export const usePendingActions = () => {
  const { events } = useEvents();

  const [inProgress, completed] = partition<Event>(isInProgressEvent, events);

  const allEvents = [
    ...inProgress.map(formatProgressEventForDisplay),
    ...completed.map(formatEventForDisplay)
  ];

  return allEvents.filter(thisAction =>
    Boolean(thisAction.body)
  ) as NotificationItem[];
};

const formatEventForDisplay = (event: ExtendedEvent): NotificationItem => ({
  id: `event-${event.id}`,
  body: <RenderEvent event={event} />,
  countInTotal: !event.seen
});

const formatProgressEventForDisplay = (
  event: ExtendedEvent
): NotificationItem => ({
  id: `progress-event-${event.id}`,
  body: <RenderProgressEvent event={event} />,
  countInTotal: !event.seen
});

export default usePendingActions;
