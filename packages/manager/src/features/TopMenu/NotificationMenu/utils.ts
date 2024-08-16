import type { Event } from '@linode/api-v4';
import type { NotificationItem } from 'src/features/NotificationCenter/NotificationSection.tsx';

type EventOrNotification = Event | NotificationItem;

/**
 * @deprecated This function is only used in the NotificationMenu (v1) component, which is deprecated.
 */
function isNotificationItem(
  item: EventOrNotification
): item is NotificationItem {
  return 'eventId' in item;
}

export const getHighestEventId = (
  events: EventOrNotification[]
): null | number => {
  let highestId: null | number = null;

  for (const event of events) {
    const id = isNotificationItem(event) ? event.eventId ?? null : event.id;

    if (id !== null) {
      highestId = highestId === null ? id : Math.max(highestId, id);
    }
  }

  return highestId;
};

export const getHighestUnseenEventId = (events: Event[]) => {
  let highestUnseenEventId: null | number = null;

  for (const event of events) {
    if (
      !event.seen &&
      (highestUnseenEventId === null || event.id > highestUnseenEventId)
    ) {
      highestUnseenEventId = event.id;
    }
  }

  return highestUnseenEventId;
};
