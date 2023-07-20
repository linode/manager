import { Event, EventAction } from '@linode/api-v4';
import * as React from 'react';

import { useEventsInfiniteQuery } from 'src/queries/events';
import {
  isInProgressEvent,
  removeBlocklistedEvents,
} from 'src/utilities/eventUtils';
import { partition } from 'src/utilities/partition';

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
  const { events } = useEventsInfiniteQuery();
  const filteredEvents = removeBlocklistedEvents(
    events?.slice(0, 25),
    unwantedEvents
  );
  const notificationContext = React.useContext(_notificationContext);

  const [inProgress, completed] = partition<Event>(
    isInProgressEvent,
    filteredEvents
  );

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
  event: Event,
  onClose: () => void
): NotificationItem => ({
  body: <RenderEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
  id: `event-${event.id}`,
  originalId: event.id,
});

const formatProgressEventForDisplay = (
  event: Event,
  onClose: () => void
): NotificationItem => ({
  body: <RenderProgressEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
  id: `progress-event-${event.id}`,
  originalId: event.id,
});
