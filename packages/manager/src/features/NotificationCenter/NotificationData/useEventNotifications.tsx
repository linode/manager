import { Event, EventAction } from '@linode/api-v4/lib/account/types';
import { partition } from 'ramda';
import * as React from 'react';

import { useEventsInfiniteQuery } from 'src/queries/events/events';
import { isInProgressEvent } from 'src/queries/events/event.helpers';
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

export const useEventNotifications = (givenEvents?: Event[]) => {
  const events = removeBlocklistedEvents(
    givenEvents ?? useEventsInfiniteQuery().events
  );
  const notificationContext = React.useContext(_notificationContext);

  const _events = events.filter(
    (thisEvent) => !unwantedEvents.includes(thisEvent.action)
  );

  const [inProgress, completed] = partition<Event>(isInProgressEvent, _events);

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
  eventId: event.id,
  id: `event-${event.id}`,
});

const formatProgressEventForDisplay = (
  event: Event,
  onClose: () => void
): NotificationItem => ({
  body: <RenderProgressEvent event={event} onClose={onClose} />,
  countInTotal: !event.seen,
  eventId: event.id,
  id: `progress-event-${event.id}`,
});
