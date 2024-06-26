// TODO eventMessagesV2: delete when flag is removed
import { partition } from 'ramda';
import * as React from 'react';

import { useIsTaxIdEnabled } from 'src/features/Account/utils';
import { isInProgressEvent } from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';
import { removeBlocklistedEvents } from 'src/utilities/eventUtils';

import { notificationContext as _notificationContext } from '../NotificationContext';
import { RenderEvent } from './RenderEvent';
import RenderProgressEvent from './RenderProgressEvent';

import type { NotificationItem } from '../NotificationSection';
import type { Event, EventAction } from '@linode/api-v4/lib/account/types';

const defaultUnwantedEvents: EventAction[] = [
  'account_update',
  'account_settings_update',
  'credit_card_updated',
  'profile_update',
  'ticket_attachment_upload',
  'volume_update',
];

export const useEventNotifications = (): NotificationItem[] => {
  const { events: fetchedEvents } = useEventsInfiniteQuery();
  const relevantEvents = removeBlocklistedEvents(fetchedEvents);
  const { isTaxIdEnabled } = useIsTaxIdEnabled();
  const notificationContext = React.useContext(_notificationContext);

  // TODO: TaxId - This entire function can be removed when we cleanup tax id feature flags
  const unwantedEventTypes = React.useMemo(() => {
    const eventTypes = [...defaultUnwantedEvents];
    if (!isTaxIdEnabled) {
      eventTypes.push('tax_id_invalid');
    }
    return eventTypes;
  }, [isTaxIdEnabled]);

  const filteredEvents = relevantEvents.filter(
    (event) => !unwantedEventTypes.includes(event.action)
  );

  const [inProgressEvents, completedEvents] = partition<Event>(
    isInProgressEvent,
    filteredEvents
  );

  const allNotificationItems = [
    ...inProgressEvents.map((event) =>
      formatProgressEventForDisplay(event, notificationContext.closeMenu)
    ),
    ...completedEvents.map((event) =>
      formatEventForDisplay(event, notificationContext.closeMenu)
    ),
  ];

  return allNotificationItems.filter((notification) =>
    Boolean(notification.body)
  );
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
