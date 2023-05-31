import { Event, EventAction } from '@linode/api-v4';
import { partition } from 'ramda';
import * as React from 'react';
import { useEventsInfiniteQuery } from 'src/queries/events';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import { removeBlocklistedEvents } from 'src/utilities/eventUtils';
import { notificationContext as _notificationContext } from '../NotificationContext';
import { NotificationItem } from '../NotificationSection';
import { RenderEvent } from './RenderEvent';
import RenderProgressEvent from './RenderProgressEvent';

const unwantedEvents: EventAction[] = [
  'account_update',
  'account_settings_update',
  'credit_card_updated',
  'profile_update',
  'ticket_attachment_upload',
  'volume_update',
];

export const useEventNotifications = () => {
  const { data: eventsData } = useEventsInfiniteQuery();
  const events = removeBlocklistedEvents(
    eventsData?.pages
      .reduce((events, page) => [...events, ...page.data], [])
      .slice(0, 25),
    unwantedEvents
  );
  const notificationContext = React.useContext(_notificationContext);

  const [inProgress, completed] = partition<Event>(isInProgressEvent, events);

  const allEvents = [
    ...inProgress.map((thisEvent) =>
      formatProgressEventForDisplay(thisEvent, notificationContext.closeMenu)
    ),
    ...completed.map((thisEvent) =>
      formatEventForDisplay(thisEvent, notificationContext.closeMenu)
    ),
  ];

  return allEvents.filter((thisAction) =>
    Boolean(thisAction.body)
  ) as NotificationItem[];
};

const formatEventForDisplay = (
  event: ExtendedEvent,
  onClose: () => void
): NotificationItem => ({
  originalId: event.id,
  id: `event-${event.id}`,
  body: <RenderEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
});

const formatProgressEventForDisplay = (
  event: ExtendedEvent,
  onClose: () => void
): NotificationItem => ({
  originalId: event.id,
  id: `progress-event-${event.id}`,
  body: <RenderProgressEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
});
